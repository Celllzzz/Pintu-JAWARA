import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateWorkingDaysDeadline,
  getHolidaysSet,
} from "@/lib/services/ticket";
import { holdUPBSStock } from "@/lib/services/stock-hold";
import { sendWhatsAppNotification } from "@/lib/services/whatsapp";
import { Database } from "@/types/database";

type TicketUpdate = Database["public"]["Tables"]["tickets"]["Update"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin_l2" && user.role !== "admin_l1")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id: ticketId } = await params;
  const body = await req.json().catch(() => ({}));
  const notes = (body.notes as string) || "";

  const supabase = createAdminClient();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_number,
      applicant_name,
      whatsapp_number,
      whatsapp_pin_last4,
      status,
      team_id,
      sla_days,
      sla_started_at,
      sla_paused_at,
      sla_total_paused_seconds,
      sla_deadline,
      variety_id,
      requested_quantity,
      version
    `)
    .eq("id", ticketId)
    .is("deleted_at", null)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
  }

  // Ensure Admin L2 only processes their own team's tickets
  if (user.role === "admin_l2" && user.team_id && ticket.team_id !== user.team_id) {
    return NextResponse.json(
      { error: "Akses ditolak: Tiket ini bukan kewenangan tim Anda." },
      { status: 403 }
    );
  }

  if (ticket.status !== "disposisi" && ticket.status !== "perlu_perbaikan") {
    return NextResponse.json(
      { error: `Tiket berstatus '${ticket.status}' tidak dapat diproses.` },
      { status: 400 }
    );
  }

  const holidaySet = await getHolidaysSet();
  const now = new Date();
  const updatePayload: TicketUpdate = {
    status: "diproses",
    processed_by: user.id,
    version: ticket.version + 1,
    updated_at: now.toISOString(),
  };

  let auditAction = "mulai_proses";
  let auditNotes = notes.trim()
    ? `Petugas memulai penanganan layanan: ${notes.trim()}`
    : "Petugas unit memulai pemrosesan layanan (argo SLA hari kerja aktif).";

  if (ticket.status === "disposisi") {
    // 1. First time process: SLA clock starts
    const deadline = calculateWorkingDaysDeadline(now, ticket.sla_days, holidaySet);
    updatePayload.sla_started_at = now.toISOString();
    updatePayload.sla_deadline = deadline.toISOString();
  } else if (ticket.status === "perlu_perbaikan") {
    // 2. Resuming process: compute paused duration
    auditAction = "lanjut_proses";
    auditNotes = notes.trim()
      ? `Petugas melanjutkan penanganan layanan: ${notes.trim()}`
      : "Petugas unit melanjutkan pemrosesan layanan (SLA dilanjutkan).";

    if (ticket.sla_paused_at) {
      const pausedAt = new Date(ticket.sla_paused_at).getTime();
      const diffSeconds = Math.max(0, Math.floor((now.getTime() - pausedAt) / 1000));
      updatePayload.sla_total_paused_seconds =
        (ticket.sla_total_paused_seconds || 0) + diffSeconds;
      updatePayload.sla_paused_at = null;
    }

    // Re-hold stock if UPBS variety
    if (ticket.variety_id && ticket.requested_quantity && ticket.requested_quantity > 0) {
      await holdUPBSStock(ticket.variety_id, ticket.requested_quantity);
    }
  }

  const { error: updateError } = await supabase
    .from("tickets")
    .update(updatePayload)
    .eq("id", ticket.id)
    .eq("version", ticket.version);

  if (updateError) {
    return NextResponse.json(
      { error: "Gagal memproses tiket (terjadi konflik versi data)." },
      { status: 409 }
    );
  }

  await supabase.from("ticket_audit_logs").insert({
    ticket_id: ticket.id,
    action: auditAction,
    old_status: ticket.status,
    new_status: "diproses",
    actor_type: user.role,
    actor_id: user.id,
    actor_name: user.full_name,
    notes: auditNotes,
  });

  // Send WhatsApp notification to applicant (non-blocking)
  sendWhatsAppNotification("diproses", {
    ticketNumber: ticket.ticket_number,
    applicantName: ticket.applicant_name,
    whatsappNumber: ticket.whatsapp_number,
    pinLast4: ticket.whatsapp_pin_last4,
    notes: notes.trim() || undefined,
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    message: "Layanan berhasil diproses.",
  });
}
