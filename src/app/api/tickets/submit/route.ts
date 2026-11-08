import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueTicketNumber } from "@/lib/services/ticket-number";
import { ServiceMechanism } from "@/types/database";
import { sendWhatsAppNotification } from "@/lib/services/whatsapp";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 1 * 1024 * 1024; // Strictly 1MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const categoryId = formData.get("category_id") as string;
    const subServiceId = formData.get("sub_service_id") as string;
    const applicantName = formData.get("applicant_name") as string;
    const whatsappNumber = formData.get("whatsapp_number") as string;
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File | null;

    // Optional UPBS fields
    const mechanism = (formData.get("mechanism") as string) || null;
    const varietyId = (formData.get("variety_id") as string) || null;
    const requestedQuantity = formData.get("requested_quantity")
      ? Number(formData.get("requested_quantity"))
      : null;
    const estimatedCost = formData.get("estimated_cost")
      ? Number(formData.get("estimated_cost"))
      : null;

    // Basic Validation
    if (
      !categoryId ||
      !subServiceId ||
      !applicantName?.trim() ||
      !whatsappNumber?.trim() ||
      !subject?.trim() ||
      !description?.trim()
    ) {
      return NextResponse.json(
        { error: "Semua bidang formulir wajib diisi lengkap." },
        { status: 400 }
      );
    }

    // Phone & PIN Extraction (Clean to digits, extract last 4)
    const cleanPhoneDigits = whatsappNumber.replace(/\D/g, "");
    if (cleanPhoneDigits.length < 9) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid (minimal 9 digit angka)." },
        { status: 400 }
      );
    }
    const pinLast4 = cleanPhoneDigits.slice(-4);

    const hasFile = Boolean(file && typeof file === "object" && file.size > 0 && file.name);

    if (hasFile && file) {
      // File Validation: strictly <= 1MB
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Ukuran berkas melebihi batas maksimum 1 MB." },
          { status: 400 }
        );
      }

      // File Validation: strictly PDF or DOC/DOCX
      const ext = file.name.split(".").pop()?.toLowerCase();
      const isValidExt = ext === "pdf" || ext === "doc" || ext === "docx";
      const isValidMime = ALLOWED_MIME_TYPES.includes(file.type);

      if (!isValidExt && !isValidMime) {
        return NextResponse.json(
          {
            error:
              "Format berkas tidak didukung. Harap unggah dokumen dengan format PDF (.pdf) atau Word (.doc, .docx).",
          },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();

    // Fetch Category info for code and SLA
    const { data: category, error: catError } = await supabase
      .from("service_categories")
      .select("code, name, sla_days")
      .eq("id", categoryId)
      .is("deleted_at", null)
      .single();

    if (catError || !category) {
      return NextResponse.json(
        { error: "Kategori layanan yang dipilih tidak valid." },
        { status: 400 }
      );
    }

    // Generate Globally Unique Ticket Number
    const ticketNumber = await generateUniqueTicketNumber(category.code);

    // 1. Insert Ticket Record
    const { data: newTicket, error: ticketInsertError } = await supabase
      .from("tickets")
      .insert({
        ticket_number: ticketNumber,
        category_id: categoryId,
        sub_service_id: subServiceId,
        applicant_name: applicantName.trim(),
        whatsapp_number: whatsappNumber.trim(),
        whatsapp_pin_last4: pinLast4,
        subject: subject.trim(),
        description: description.trim(),
        status: "diajukan",
        mechanism: (mechanism as ServiceMechanism) || null,
        variety_id: varietyId || null,
        requested_quantity: requestedQuantity,
        estimated_cost: estimatedCost,
        sla_days: category.sla_days,
      })
      .select("id")
      .single();

    if (ticketInsertError || !newTicket) {
      return NextResponse.json(
        { error: `Gagal membuat tiket: ${ticketInsertError?.message}` },
        { status: 500 }
      );
    }

    // 2. Upload Document to Supabase Storage Bucket 'documents' (if provided)
    if (hasFile && file) {
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storageFilePath = `tickets/${newTicket.id}/${Date.now()}_${sanitizedFileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const { error: storageError } = await supabase.storage
        .from("documents")
        .upload(storageFilePath, fileBuffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (storageError) {
        // Rollback ticket if storage fails
        await supabase.from("tickets").delete().eq("id", newTicket.id);
        return NextResponse.json(
          { error: `Gagal mengunggah berkas persyaratan: ${storageError.message}` },
          { status: 500 }
        );
      }

      // 3. Insert Document Record
      await supabase.from("ticket_documents").insert({
        ticket_id: newTicket.id,
        document_type: "persyaratan_awal",
        file_name: file.name,
        file_path: storageFilePath,
        file_size_bytes: file.size,
        mime_type: file.type,
        uploaded_by_role: "pemohon",
      });
    }

    // 4. Record Immutable Audit Log
    await supabase.from("ticket_audit_logs").insert({
      ticket_id: newTicket.id,
      action: "pengajuan_baru",
      old_status: null,
      new_status: "diajukan",
      actor_type: "pemohon",
      actor_name: applicantName.trim(),
      notes:
        hasFile && file
          ? `Permohonan baru diajukan oleh pemohon dengan berkas persyaratan: ${file.name}`
          : "Permohonan baru diajukan oleh pemohon tanpa lampiran berkas",
      metadata: {
        file_name: hasFile && file ? file.name : null,
        file_size_bytes: hasFile && file ? file.size : null,
        category_code: category.code,
      },
    });

    // 5. Send WhatsApp notification (asynchronous, non-blocking)
    sendWhatsAppNotification("pengajuan_baru", {
      ticketNumber,
      applicantName: applicantName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      serviceName: category.name,
      pinLast4,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      ticket_id: newTicket.id,
      ticket_number: ticketNumber,
      pin_last4: pinLast4,
      applicantName: applicantName.trim(),
      subject: subject.trim(),
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
