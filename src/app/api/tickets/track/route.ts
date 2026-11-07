import { NextRequest, NextResponse } from "next/server";
import { getTicketForTracking } from "@/lib/services/ticket";
import { signTicketToken } from "@/lib/auth/ticket-token";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

  try {
    const { ticket_number, pin_last4 } = await req.json();

    if (!ticket_number || !pin_last4) {
      return NextResponse.json(
        {
          error:
            "Nomor e-tiket dan 4 digit terakhir nomor yang digunakan saat pengajuan wajib diisi.",
        },
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

    const rateLimitKey = `track:${cleanTicket}:${ip}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan verifikasi gagal. Silakan coba kembali dalam ${rateLimit.retryAfterSeconds} detik.`,
        },
        {
          status: 429,
          headers: { "Retry-After": rateLimit.retryAfterSeconds.toString() },
        }
      );
    }

    const result = await getTicketForTracking(cleanTicket, cleanPin);

    if (!result.success || !result.ticket) {
      return NextResponse.json(
        {
          error:
            result.error ||
            "Data tiket tidak ditemukan atau verifikasi PIN tidak sesuai.",
        },
        { status: 401 }
      );
    }

    resetRateLimit(rateLimitKey);

    const token = signTicketToken(result.ticket.id, 7200);

    const response = NextResponse.json({
      success: true,
      ticket: result.ticket,
    });

    response.cookies.set("pj_ticket_access", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7200,
    });

    return response;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
