import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { holdUPBSStock } from "@/lib/services/stock-hold";
import { Json } from "@/types/database";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin_l1") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id: ticketId } = await params;
  const supabase = createAdminClient();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("id, ticket_number, status, variety_id, requested_quantity, version, applicant_name")
    .eq("id", ticketId)
    .is("deleted_at", null)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
  }

  if (ticket.status !== "diajukan" && ticket.status !== "perlu_perbaikan") {
    return NextResponse.json(
      { error: `Tiket berstatus '${ticket.status}' tidak dapat diverifikasi ulang.` },
      { status: 400 }
    );
  }

  // Hold stock for UPBS Padi or UPBS Ayam if applicable
  let holdResult = null;
  if (ticket.variety_id && ticket.requested_quantity && ticket.requested_quantity > 0) {
    holdResult = await holdUPBSStock(ticket.variety_id, ticket.requested_quantity);
  }

  const { error: updateError } = await supabase
    .from("tickets")
    .update({
      status: "diverifikasi",
      verified_by: user.id,
      version: ticket.version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticket.id)
    .eq("version", ticket.version);

  if (updateError) {
    return NextResponse.json(
      { error: "Gagal memperbarui status tiket (konflik versi)." },
      { status: 409 }
    );
  }

  // Record audit log
  await supabase.from("ticket_audit_logs").insert({
    ticket_id: ticket.id,
    action: "verifikasi_berkas",
    old_status: ticket.status,
    new_status: "diverifikasi",
    actor_type: "admin_l1",
    actor_id: user.id,
    actor_name: user.full_name,
    notes: holdResult?.warning
      ? `Berkas diverifikasi lengkap. Catatan stok: ${holdResult.warning}`
      : "Berkas persyaratan administrasi dinyatakan lengkap dan valid.",
    metadata: (holdResult ? { hold_stock: JSON.parse(JSON.stringify(holdResult)) } : {}) as Json,
  });

  return NextResponse.json({
    success: true,
    message: "Berkas berhasil diverifikasi.",
    holdResult,
  });
}
