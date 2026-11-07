import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/auth/password";
import { UserRole } from "@/types/database";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin_l1") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data: users, error } = await supabase
    .from("users")
    .select(`
      id,
      email,
      full_name,
      phone_number,
      role,
      team_id,
      is_active,
      created_at,
      teams (
        id,
        name,
        code
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, code")
    .is("deleted_at", null)
    .order("name");

  return NextResponse.json({ users, teams: teams || [] });
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin_l1") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const { email, password, full_name, phone_number, role, team_id } = await req.json();

    if (!email || !full_name || !role) {
      return NextResponse.json(
        { error: "Email, nama lengkap, dan peran wajib diisi." },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ["admin_l1", "admin_l2", "pimpinan"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Peran tidak valid." }, { status: 400 });
    }

    if (role === "admin_l2" && !team_id) {
      return NextResponse.json(
        { error: "Petugas Unit wajib ditugaskan ke salah satu Tim Penanganan." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .is("deleted_at", null)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 }
      );
    }

    const plainPassword = password?.trim() || "Admin123";
    const passwordHash = await hashPassword(plainPassword);

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email: email.trim().toLowerCase(),
        password_hash: passwordHash,
        full_name: full_name.trim(),
        phone_number: phone_number?.trim() || null,
        role,
        team_id: role === "admin_l2" ? team_id : null,
        created_by: currentUser.id,
        is_active: true,
      })
      .select("id, email, full_name, role, team_id, is_active, created_at")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Gagal membuat user: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Akun petugas berhasil dibuat.",
      user: newUser,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
