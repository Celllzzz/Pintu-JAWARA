import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signTicketToken } from "@/lib/auth/ticket-token";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

  try {
    const { ticket_number, pin_last4 } = await req.json();

    if (!ticket_number || !pin_last4) {
      return NextResponse.json(
        { error: "Nomor e-tiket dan 4 digit terakhir nomor yang digunakan saat pengajuan wajib diisi." },
        { status: 400 }
      );
    }

    const cleanTicket = ticket_number.trim().toUpperCase();
    const cleanPin = pin_last4.trim();

    if (cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
      return NextResponse.json(
        { error: "PIN verifikasi harus berupa 4 digit angka." },
        { status: 400 }
      );
    }

    const rateLimitKey = `verify-wa:${cleanTicket}:${ip}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan verifikasi gagal. Coba lagi dalam ${rateLimit.retryAfterSeconds} detik.`,
        },
        {
          status: 429,
          headers: { "Retry-After": rateLimit.retryAfterSeconds.toString() },
        }
      );
    }

    const supabase = createAdminClient();
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("id, ticket_number, whatsapp_pin_last4, status")
      .eq("ticket_number", cleanTicket)
      .is("deleted_at", null)
      .single();

    if (error || !ticket) {
      return NextResponse.json(
        { error: "Nomor e-tiket tidak ditemukan atau tidak valid." },
        { status: 404 }
      );
    }

    if (ticket.whatsapp_pin_last4 !== cleanPin) {
      return NextResponse.json(
        {
          error: `4 digit nomor yang digunakan saat pengajuan tidak cocok. Sisa percobaan: ${rateLimit.remaining}`,
        },
        { status: 401 }
      );
    }

    resetRateLimit(rateLimitKey);

    const token = signTicketToken(ticket.id, 7200);

    const res = NextResponse.json({
      success: true,
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      status: ticket.status,
    });

    res.cookies.set("pj_ticket_access", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7200,
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
