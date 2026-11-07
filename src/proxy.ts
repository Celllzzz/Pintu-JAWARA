import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/admin", "/pimpinan"];

async function hashSha256(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isLoginPage = pathname === "/login";

  const sessionToken = req.cookies.get("pj_session")?.value;

  if (!isProtected && !isLoginPage) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.next();
  }

  let sessionUser: { role: string; team_id: string | null } | null = null;

  if (sessionToken) {
    try {
      const tokenHash = await hashSha256(sessionToken);
      const nowIso = new Date().toISOString();

      const queryUrl = `${supabaseUrl}/rest/v1/user_sessions?token_hash=eq.${tokenHash}&expires_at=gt.${nowIso}&select=users!inner(role,is_active,deleted_at,team_id)&limit=1`;
      const res = await fetch(queryUrl, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0 && rows[0].users) {
          const user = rows[0].users;
          if (user.is_active && user.deleted_at === null) {
            sessionUser = { role: user.role, team_id: user.team_id };
          }
        }
      }
    } catch {
      sessionUser = null;
    }
  }

  if (isLoginPage) {
    if (sessionUser) {
      if (sessionUser.role === "admin_l2") {
        return NextResponse.redirect(new URL("/admin/unit/tickets", req.url));
      } else if (sessionUser.role === "pimpinan") {
        return NextResponse.redirect(new URL("/pimpinan", req.url));
      } else {
        return NextResponse.redirect(new URL("/admin/tickets", req.url));
      }
    }
    return NextResponse.next();
  }

  if (isProtected) {
    if (!sessionUser) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin/users") && sessionUser.role !== "admin_l1") {
      const target =
        sessionUser.role === "admin_l2"
          ? "/admin/unit/tickets"
          : "/pimpinan";
      return NextResponse.redirect(new URL(target, req.url));
    }

    if (pathname.startsWith("/admin/unit") && sessionUser.role !== "admin_l2") {
      const target =
        sessionUser.role === "pimpinan" ? "/pimpinan" : "/admin/tickets";
      return NextResponse.redirect(new URL(target, req.url));
    }

    if (
      pathname.startsWith("/pimpinan") &&
      sessionUser.role !== "pimpinan"
    ) {
      const target =
        sessionUser.role === "admin_l1" ? "/admin/tickets" : "/admin/unit/tickets";
      return NextResponse.redirect(new URL(target, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/pimpinan/:path*", "/login"],
};
