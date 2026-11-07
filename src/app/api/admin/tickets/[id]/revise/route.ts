import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { releaseUPBSStock } from "@/lib/services/stock-hold";
import { sendWhatsAppNotification } from "@/lib/services/whatsapp";
import { Database } from "@/types/database";

type TicketUpdate = Database["public"]["Tables"]["tickets"]["Update"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin_l1" && user.role !== "admin_l2")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id: ticketId } = await params;
  const { notes } = await req.json();

  if (!notes || !notes.trim()) {
    return NextResponse.json(
      { error: "Catatan perbaikan berkas wajib diisi untuk pemohon." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("id, ticket_number, applicant_name, whatsapp_number, whatsapp_pin_last4, status, variety_id, requested_quantity, version, sla_started_at")
    .eq("id", ticketId)
    .is("deleted_at", null)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
  }

  // Release held stock if previously held
  if (ticket.variety_id && ticket.requested_quantity && ticket.requested_quantity > 0) {
    await releaseUPBSStock(ticket.variety_id, ticket.requested_quantity);
  }

  const updatePayload: TicketUpdate = {
    status: "perlu_perbaikan",
    completion_note: notes.trim(),
    version: ticket.version + 1,
    updated_at: new Date().toISOString(),
  };

  // If already diproses, pause the SLA argo
  if (ticket.status === "diproses" && ticket.sla_started_at) {
    updatePayload.sla_paused_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("tickets")
    .update(updatePayload)
    .eq("id", ticket.id)
    .eq("version", ticket.version);

  if (updateError) {
    return NextResponse.json(
      { error: "Gagal memperbarui status perbaikan (konflik versi)." },
      { status: 409 }
    );
  }

  await supabase.from("ticket_audit_logs").insert({
    ticket_id: ticket.id,
    action: "minta_perbaikan",
    old_status: ticket.status,
    new_status: "perlu_perbaikan",
    actor_type: user.role,
    actor_id: user.id,
    actor_name: user.full_name,
    notes: `Petugas meminta perbaikan berkas: ${notes.trim()}`,
  });

  // Send WhatsApp notification to applicant (non-blocking)
  sendWhatsAppNotification("perlu_perbaikan", {
    ticketNumber: ticket.ticket_number,
    applicantName: ticket.applicant_name,
    whatsappNumber: ticket.whatsapp_number,
    pinLast4: ticket.whatsapp_pin_last4,
    notes: notes.trim(),
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    message: "Tiket dialihkan ke status Perlu Perbaikan.",
  });
}
