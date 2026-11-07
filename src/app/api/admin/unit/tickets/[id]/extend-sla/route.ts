import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateWorkingDaysDeadline,
  getHolidaysSet,
} from "@/lib/services/ticket";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin_l2" && user.role !== "admin_l1")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id: ticketId } = await params;
  const { reason } = await req.json();

  if (!reason || !reason.trim()) {
    return NextResponse.json(
      { error: "Alasan perpanjangan waktu SLA wajib diisi secara rinci." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_number,
      status,
      team_id,
      sla_deadline,
      is_sla_extended,
      version,
      service_categories!inner (
        code
      )
    `)
    .eq("id", ticketId)
    .is("deleted_at", null)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
  }

  const catCode = (ticket.service_categories as unknown as { code: string })?.code;
  if (catCode !== "IP") {
    return NextResponse.json(
      { error: "Fitur perpanjangan SLA hanya berlaku khusus untuk layanan Informasi Publik (PPID)." },
      { status: 400 }
    );
  }

  if (ticket.is_sla_extended) {
    return NextResponse.json(
      { error: "Perpanjangan SLA (+7 hari) hanya dapat dilakukan satu kali per tiket." },
      { status: 400 }
    );
  }

  const holidaySet = await getHolidaysSet();
  const currentDeadline = ticket.sla_deadline ? new Date(ticket.sla_deadline) : new Date();
  const newDeadline = calculateWorkingDaysDeadline(currentDeadline, 7, holidaySet);

  const { error: updateError } = await supabase
    .from("tickets")
    .update({
      is_sla_extended: true,
      sla_extension_reason: reason.trim(),
      sla_extended_by: user.id,
      sla_deadline: newDeadline.toISOString(),
      version: ticket.version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticket.id)
    .eq("version", ticket.version);

  if (updateError) {
    return NextResponse.json(
      { error: "Gagal memperpanjang SLA (konflik versi)." },
      { status: 409 }
    );
  }

  await supabase.from("ticket_audit_logs").insert({
    ticket_id: ticket.id,
    action: "perpanjang_sla_ppid",
    old_status: ticket.status,
    new_status: ticket.status,
    actor_type: user.role,
    actor_id: user.id,
    actor_name: user.full_name,
    notes: `Perpanjangan SLA +7 hari kerja PPID: ${reason.trim()}`,
  });

  return NextResponse.json({
    success: true,
    message: "SLA berhasil diperpanjang 7 hari kerja.",
    newDeadline: newDeadline.toISOString(),
  });
}
