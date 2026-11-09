import crypto from "crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserRole } from "@/types/database";

export const SESSION_COOKIE_NAME = "pj_session";
export const SESSION_TTL_SECONDS = 24 * 60 * 60;

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  role: UserRole;
  team_id: string | null;
  team_name?: string | null;
  team_code?: string | null;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  const supabase = createAdminClient();
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  const { error } = await supabase.from("user_sessions").insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    ip_address: meta?.ipAddress ?? null,
    user_agent: meta?.userAgent ?? null,
  });

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return rawToken;
}

export const validateSessionToken = cache(
  async (token: string): Promise<SessionUser | null> => {
    if (!token) return null;

    const supabase = createAdminClient();
    const tokenHash = hashToken(token);

    const { data: session, error } = await supabase
      .from("user_sessions")
      .select(`
        id,
        expires_at,
        users!inner (
          id,
          email,
          full_name,
          phone_number,
          role,
          team_id,
          is_active,
          deleted_at,
          teams (
            name,
            code
          )
        )
      `)
      .eq("token_hash", tokenHash)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !session) {
      return null;
    }

    interface UserRowResult {
      id: string;
      email: string;
      full_name: string;
      phone_number: string | null;
      role: UserRole;
      team_id: string | null;
      is_active: boolean;
      deleted_at: string | null;
      teams?: { name: string; code: string } | null;
    }

    const user = session.users as unknown as UserRowResult;
    if (!user || !user.is_active || user.deleted_at !== null) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number,
      role: user.role,
      team_id: user.team_id,
      team_name: user.teams?.name ?? null,
      team_code: user.teams?.code ?? null,
    };
  }
);

export const getCurrentUser = cache(
  async (): Promise<SessionUser | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return validateSessionToken(token);
  }
);

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const supabase = createAdminClient();
    const tokenHash = hashToken(token);
    await supabase.from("user_sessions").delete().eq("token_hash", tokenHash);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
