import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppNotification } from "@/lib/services/whatsapp";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin_l1") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id: ticketId } = await params;
  const { team_id } = await req.json();

  if (!team_id) {
    return NextResponse.json(
      { error: "Pilih salah satu Tim Penanganan tujuan disposisi." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const [ticketRes, teamRes] = await Promise.all([
    supabase
      .from("tickets")
      .select("id, ticket_number, applicant_name, whatsapp_number, whatsapp_pin_last4, status, version")
      .eq("id", ticketId)
      .is("deleted_at", null)
      .single(),

    supabase
      .from("teams")
      .select("id, name, code")
      .eq("id", team_id)
      .is("deleted_at", null)
      .single(),
  ]);

  if (ticketRes.error || !ticketRes.data) {
    return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
  }

  if (teamRes.error || !teamRes.data) {
    return NextResponse.json({ error: "Tim penanganan tidak valid." }, { status: 400 });
  }

  const ticket = ticketRes.data;
  const team = teamRes.data;

  if (ticket.status !== "diverifikasi" && ticket.status !== "disposisi") {
    return NextResponse.json(
      { error: `Tiket berstatus '${ticket.status}' harus diverifikasi lengkap sebelum didisposisikan.` },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("tickets")
    .update({
      status: "disposisi",
      team_id: team.id,
      disposed_by: user.id,
      disposed_at: new Date().toISOString(),
      version: ticket.version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticket.id)
    .eq("version", ticket.version);

  if (updateError) {
    return NextResponse.json(
      { error: "Gagal mendisposisikan tiket (konflik versi)." },
      { status: 409 }
    );
  }

  await supabase.from("ticket_audit_logs").insert({
    ticket_id: ticket.id,
    action: "disposisi_tim",
    old_status: ticket.status,
    new_status: "disposisi",
    actor_type: "admin_l1",
    actor_id: user.id,
    actor_name: user.full_name,
    notes: `Tiket didisposisikan ke Tim Penanganan: ${team.name}`,
    metadata: {
      team_id: team.id,
      team_name: team.name,
      team_code: team.code,
    },
  });

  // Send WhatsApp notification to applicant (non-blocking)
  sendWhatsAppNotification("disposisi", {
    ticketNumber: ticket.ticket_number,
    applicantName: ticket.applicant_name,
    whatsappNumber: ticket.whatsapp_number,
    pinLast4: ticket.whatsapp_pin_last4,
    teamName: team.name,
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    message: `Tiket berhasil didisposisikan ke ${team.name}.`,
  });
}
