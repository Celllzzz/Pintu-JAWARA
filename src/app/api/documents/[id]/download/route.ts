import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: docId } = await params;
  const supabase = createAdminClient();

  const { data: doc, error: docError } = await supabase
    .from("ticket_documents")
    .select("file_path, file_name, mime_type")
    .eq("id", docId)
    .is("deleted_at", null)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "Dokumen tidak ditemukan." }, { status: 404 });
  }

  const { data: fileData, error: storageError } = await supabase.storage
    .from("documents")
    .download(doc.file_path);

  if (storageError || !fileData) {
    return NextResponse.json(
      { error: "Gagal mengunduh berkas dari penyimpanan." },
      { status: 500 }
    );
  }

  const arrayBuffer = await fileData.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": doc.mime_type || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.file_name)}"`,
    },
  });
}
