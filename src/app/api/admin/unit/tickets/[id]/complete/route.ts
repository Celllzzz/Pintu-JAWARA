import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { deductUPBSStock } from "@/lib/services/stock-deduct";
import { sendWhatsAppNotification } from "@/lib/services/whatsapp";
import { Database } from "@/types/database";

type TicketUpdate = Database["public"]["Tables"]["tickets"]["Update"];

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for result document

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin_l2" && user.role !== "admin_l1")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id: ticketId } = await params;
  const formData = await req.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json({ error: "Form data tidak valid." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const notes = ((formData.get("notes") as string) || "").trim();

  // Validation: at least file or notes must be filled!
  if (!file && !notes) {
    return NextResponse.json(
      { error: "Harap isi minimal salah satu: Dokumen Hasil Layanan atau Catatan Informasi/Klarifikasi." },
      { status: 400 }
    );
  }

  if (file) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran berkas hasil layanan melebihi batas 10 MB." },
        { status: 400 }
      );
    }
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format berkas tidak didukung. Harap unggah PDF, Word, atau gambar." },
        { status: 400 }
      );
    }
  }

  const supabase = createAdminClient();

  const { data: ticket, error: tErr } = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_number,
      applicant_name,
      whatsapp_number,
      whatsapp_pin_last4,
      status,
      team_id,
      variety_id,
      requested_quantity,
      version
    `)
    .eq("id", ticketId)
    .is("deleted_at", null)
    .single();

  if (tErr || !ticket) {
    return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
  }

  if (user.role === "admin_l2" && user.team_id && ticket.team_id !== user.team_id) {
    return NextResponse.json({ error: "Akses ditolak: Bukan kewenangan tim Anda." }, { status: 403 });
  }

  // 1. Upload file if provided
  let uploadedDocId: string | null = null;
  if (file && file.size > 0) {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `tickets/${ticket.id}/hasil_${Date.now()}_${sanitizedName}`;
    const arrayBuf = await file.arrayBuffer();

    const { error: uploadErr } = await supabase.storage
      .from("documents")
      .upload(storagePath, Buffer.from(arrayBuf), {
        contentType: file.type || "application/pdf",
        upsert: false,
      });

    if (uploadErr) {
      return NextResponse.json(
        { error: `Gagal menyimpan berkas hasil: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    const { data: docRecord } = await supabase
      .from("ticket_documents")
      .insert({
        ticket_id: ticket.id,
        document_type: "hasil_layanan",
        file_name: file.name,
        file_path: storagePath,
        file_size_bytes: file.size,
        mime_type: file.type || "application/pdf",
        uploaded_by_role: user.role === "admin_l1" ? "admin_l1" : "admin_l2",
        uploaded_by_user: user.id,
      })
      .select("id")
      .single();

    uploadedDocId = docRecord?.id || null;
  }

  // 2. Deduct physical stock if UPBS variety
  let deductResult = null;
  if (ticket.variety_id && ticket.requested_quantity && ticket.requested_quantity > 0) {
    deductResult = await deductUPBSStock(ticket.variety_id, ticket.requested_quantity);
  }

  // 3. Complete ticket
  const updatePayload: TicketUpdate = {
    status: "selesai",
    completed_at: new Date().toISOString(),
    completion_note: notes || null,
    version: ticket.version + 1,
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from("tickets")
    .update(updatePayload)
    .eq("id", ticket.id)
    .eq("version", ticket.version);

  if (updateError) {
    return NextResponse.json({ error: "Konflik versi tiket saat penyelesaian." }, { status: 409 });
  }

  // 4. Audit log
  let auditNoteSummary = "Layanan diselesaikan oleh petugas unit.";
  if (file && notes) {
    auditNoteSummary = `Layanan diselesaikan dengan melampirkan berkas hasil (${file.name}) dan catatan: ${notes}`;
  } else if (file) {
    auditNoteSummary = `Layanan diselesaikan dengan melampirkan berkas hasil: ${file.name}`;
  } else if (notes) {
    auditNoteSummary = `Layanan diselesaikan dengan catatan/klarifikasi: ${notes}`;
  }

  await supabase.from("ticket_audit_logs").insert({
    ticket_id: ticket.id,
    action: "selesai_layanan",
    old_status: ticket.status,
    new_status: "selesai",
    actor_type: user.role,
    actor_id: user.id,
    actor_name: user.full_name,
    notes: auditNoteSummary,
    metadata: {
      document_id: uploadedDocId,
      stock_deduct: deductResult ? JSON.parse(JSON.stringify(deductResult)) : null,
    },
  });

  // Send WhatsApp notification for completed service (non-blocking)
  sendWhatsAppNotification("layanan_selesai", {
    ticketNumber: ticket.ticket_number,
    applicantName: ticket.applicant_name,
    whatsappNumber: ticket.whatsapp_number,
    pinLast4: ticket.whatsapp_pin_last4,
    notes: notes || undefined,
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    message: "Permohonan layanan berhasil diselesaikan.",
    deductResult,
  });
}
