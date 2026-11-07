import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTicketToken } from "@/lib/auth/ticket-token";
import { DocumentType } from "@/types/database";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params;

  // 1. Authorize ticket access via HMAC cookie
  const accessCookie = req.cookies.get("pj_ticket_access")?.value;
  if (!accessCookie) {
    return NextResponse.json(
      { error: "Sesi pelacakan telah berakhir. Silakan verifikasi ulang." },
      { status: 401 }
    );
  }

  const tokenValidation = verifyTicketToken(accessCookie);
  if (!tokenValidation.valid || tokenValidation.ticketId !== ticketId) {
    return NextResponse.json(
      { error: "Akses ditolak: Token verifikasi tiket tidak valid." },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const documentType = formData.get("document_type") as DocumentType;
    const file = formData.get("file") as File | null;
    const notes = (formData.get("notes") as string) || "";

    if (!documentType || !file) {
      return NextResponse.json(
        { error: "Jenis dokumen dan berkas wajib diunggah." },
        { status: 400 }
      );
    }

    const validTypes: DocumentType[] = [
      "perbaikan_berkas",
      "bukti_bayar",
      "persyaratan_awal",
    ];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: "Jenis dokumen tidak valid." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Format berkas tidak didukung. Harap unggah file PDF, JPG, atau PNG.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran berkas melebihi batas maksimum 10 MB." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 2. Verify ticket existence & status
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("id, ticket_number, status, applicant_name")
      .eq("id", ticketId)
      .is("deleted_at", null)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: "Tiket tidak ditemukan." },
        { status: 404 }
      );
    }

    // 3. Upload file to Supabase Storage bucket 'documents'
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageFilePath = `tickets/${ticket.id}/${Date.now()}_${sanitizedFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { error: storageError } = await supabase.storage
      .from("documents")
      .upload(storageFilePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      return NextResponse.json(
        { error: `Gagal mengunggah berkas ke storage: ${storageError.message}` },
        { status: 500 }
      );
    }

    // 4. Insert into ticket_documents
    const { data: docRecord, error: docInsertError } = await supabase
      .from("ticket_documents")
      .insert({
        ticket_id: ticket.id,
        document_type: documentType,
        file_name: file.name,
        file_path: storageFilePath,
        file_size_bytes: file.size,
        mime_type: file.type,
        uploaded_by_role: "pemohon",
      })
      .select("id, document_type, file_name, file_path, created_at")
      .single();

    if (docInsertError) {
      return NextResponse.json(
        { error: `Gagal mencatat dokumen: ${docInsertError.message}` },
        { status: 500 }
      );
    }

    // 5. Update billing if bukti_bayar
    if (documentType === "bukti_bayar") {
      await supabase
        .from("ticket_billings")
        .update({
          payment_status: "menunggu_verifikasi",
          updated_at: new Date().toISOString(),
        })
        .eq("ticket_id", ticket.id);
    }

    // 6. Record in immutable audit log
    const auditAction =
      documentType === "bukti_bayar"
        ? "upload_bukti_bayar"
        : "upload_perbaikan_berkas";

    const auditNotes =
      notes.trim() ||
      `Pemohon mengunggah ${
        documentType === "bukti_bayar" ? "bukti transfer" : "berkas perbaikan"
      }: ${file.name}`;

    await supabase.from("ticket_audit_logs").insert({
      ticket_id: ticket.id,
      action: auditAction,
      old_status: ticket.status,
      new_status: ticket.status,
      actor_type: "pemohon",
      actor_name: ticket.applicant_name,
      notes: auditNotes,
      metadata: {
        file_name: file.name,
        file_size_bytes: file.size,
        document_id: docRecord.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Berkas berhasil diunggah.",
      document: docRecord,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
