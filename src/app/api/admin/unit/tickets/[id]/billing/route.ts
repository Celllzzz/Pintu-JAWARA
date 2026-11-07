import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const { amount, bank_name, account_number, account_holder, notes } =
    await req.json();

  if (!amount || !bank_name?.trim() || !account_number?.trim() || !account_holder?.trim()) {
    return NextResponse.json(
      { error: "Nominal, nama bank, nomor rekening, dan nama pemilik rekening wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: ticket, error: tErr } = await supabase
    .from("tickets")
    .select("id, ticket_number, applicant_name, whatsapp_number, whatsapp_pin_last4, team_id")
    .eq("id", ticketId)
    .is("deleted_at", null)
    .single();

  if (tErr || !ticket) {
    return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
  }

  if (user.role === "admin_l2" && user.team_id && ticket.team_id !== user.team_id) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  // Upsert billing record
  const { data: billing, error: bErr } = await supabase
    .from("ticket_billings")
    .upsert(
      {
        ticket_id: ticket.id,
        amount: Number(amount),
        bank_name: bank_name.trim(),
        account_number: account_number.trim(),
        account_holder: account_holder.trim(),
        notes: notes?.trim() || null,
        payment_status: "menunggu_pembayaran",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "ticket_id" }
    )
    .select()
    .single();

  if (bErr) {
    return NextResponse.json({ error: `Gagal membuat tagihan: ${bErr.message}` }, { status: 500 });
  }

    await supabase.from("ticket_audit_logs").insert({
      ticket_id: ticket.id,
      action: "kirim_tagihan",
      old_status: null,
      new_status: null,
      actor_type: user.role,
      actor_id: user.id,
      actor_name: user.full_name,
      notes: `Petugas mengirim rincian tagihan sebesar Rp ${Number(amount).toLocaleString("id-ID")}`,
      metadata: { billing_id: billing.id, amount: Number(amount) },
    });

    // Send WhatsApp notification for billing (non-blocking)
    sendWhatsAppNotification("tagihan_baru", {
      ticketNumber: ticket.ticket_number,
      applicantName: ticket.applicant_name,
      whatsappNumber: ticket.whatsapp_number,
      pinLast4: ticket.whatsapp_pin_last4,
      amount: Number(amount),
      bankName: bank_name.trim(),
      accountNumber: account_number.trim(),
      accountHolder: account_holder.trim(),
      notes: notes?.trim() || undefined,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Rincian tagihan berhasil dikirim ke pemohon.",
      billing,
    });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin_l2" && user.role !== "admin_l1")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id: ticketId } = await params;
  const { action, notes } = await req.json();

  if (action !== "confirm" && action !== "reject") {
    return NextResponse.json({ error: "Aksi tidak valid (confirm/reject)." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: ticket, error: tErr } = await supabase
    .from("tickets")
    .select("id, ticket_number, applicant_name, whatsapp_number, whatsapp_pin_last4, status, version, team_id, sla_started_at")
    .eq("id", ticketId)
    .is("deleted_at", null)
    .single();

  if (tErr || !ticket) {
    return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
  }

  if (action === "confirm") {
    // 1. Mark billing as lunas
    const { error: bErr } = await supabase
      .from("ticket_billings")
      .update({
        payment_status: "lunas",
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("ticket_id", ticket.id);

    if (bErr) {
      return NextResponse.json({ error: bErr.message }, { status: 500 });
    }

    await supabase.from("ticket_audit_logs").insert({
      ticket_id: ticket.id,
      action: "pembayaran_lunas",
      old_status: ticket.status,
      new_status: ticket.status,
      actor_type: user.role,
      actor_id: user.id,
      actor_name: user.full_name,
      notes: "Bukti transfer telah diverifikasi dan dinyatakan LUNAS.",
    });

    return NextResponse.json({
      success: true,
      message: "Pembayaran berhasil dikonfirmasi lunas.",
    });
  } else {
    // 2. Reject: Move ticket to perlu_perbaikan and mark billing as ditolak
    const rejectReason = notes?.trim() || "Bukti transfer tidak valid atau tidak terbaca. Mohon unggah ulang bukti yang sesuai.";

    await supabase
      .from("ticket_billings")
      .update({
        payment_status: "ditolak",
        updated_at: new Date().toISOString(),
      })
      .eq("ticket_id", ticket.id);

    const ticketUpdatePayload: TicketUpdate = {
      status: "perlu_perbaikan",
      completion_note: rejectReason,
      version: ticket.version + 1,
      updated_at: new Date().toISOString(),
    };

    if (ticket.status === "diproses" && ticket.sla_started_at) {
      ticketUpdatePayload.sla_paused_at = new Date().toISOString();
    }

    const { error: tUpdateErr } = await supabase
      .from("tickets")
      .update(ticketUpdatePayload)
      .eq("id", ticket.id)
      .eq("version", ticket.version);

    if (tUpdateErr) {
      return NextResponse.json({ error: "Konflik versi tiket." }, { status: 409 });
    }

    await supabase.from("ticket_audit_logs").insert({
      ticket_id: ticket.id,
      action: "tolak_bukti_bayar",
      old_status: ticket.status,
      new_status: "perlu_perbaikan",
      actor_type: user.role,
      actor_id: user.id,
      actor_name: user.full_name,
      notes: `Petugas menolak bukti transfer: ${rejectReason}`,
    });

    // Send WhatsApp notification for rejection (non-blocking)
    sendWhatsAppNotification("bukti_bayar_ditolak", {
      ticketNumber: ticket.ticket_number,
      applicantName: ticket.applicant_name,
      whatsappNumber: ticket.whatsapp_number,
      pinLast4: ticket.whatsapp_pin_last4,
      notes: rejectReason,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Bukti transfer ditolak. Status tiket dikembalikan ke Perlu Perbaikan.",
    });
  }
}
