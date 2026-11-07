import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  const rateLimitKey = `login:${ip}`;
  const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Terlalu banyak percobaan login gagal. Coba lagi dalam ${rateLimit.retryAfterSeconds} detik.`,
      },
      {
        status: 429,
        headers: { "Retry-After": rateLimit.retryAfterSeconds.toString() },
      }
    );
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password_hash, full_name, role, is_active, team_id")
      .eq("email", email.trim().toLowerCase())
      .is("deleted_at", null)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: "Akun Anda dinonaktifkan. Hubungi Administrator." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    resetRateLimit(rateLimitKey);

    const userAgent = req.headers.get("user-agent") || undefined;
    await createSession(user.id, { ipAddress: ip, userAgent });

    let redirectUrl = "/admin/tickets";
    if (user.role === "admin_l2") {
      redirectUrl = "/admin/unit/tickets";
    } else if (user.role === "pimpinan") {
      redirectUrl = "/pimpinan";
    }

    return NextResponse.json({
      success: true,
      redirectUrl,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        team_id: user.team_id,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
