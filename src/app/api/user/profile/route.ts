import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { Database } from "@/types/database";

type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, full_name, phone_number, role, team_id, created_at, teams(name)")
    .eq("id", sessionUser.id)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { full_name, phone_number, current_password, new_password } = await req.json();

    if (!full_name || full_name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nama lengkap minimal 2 karakter." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const updatePayload: UserUpdate = {
      full_name: full_name.trim(),
      phone_number: phone_number?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (new_password) {
      if (!current_password) {
        return NextResponse.json(
          { error: "Password saat ini wajib diisi untuk mengganti password." },
          { status: 400 }
        );
      }

      if (new_password.length < 8) {
        return NextResponse.json(
          { error: "Password baru minimal 8 karakter." },
          { status: 400 }
        );
      }

      const { data: userAuth } = await supabase
        .from("users")
        .select("password_hash")
        .eq("id", sessionUser.id)
        .single();

      if (!userAuth) {
        return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
      }

      const isCurrentValid = await verifyPassword(current_password, userAuth.password_hash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "Password saat ini salah." },
          { status: 400 }
        );
      }

      updatePayload.password_hash = await hashPassword(new_password);
    }

    const { error: updateError } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", sessionUser.id);

    if (updateError) {
      return NextResponse.json(
        { error: `Gagal memperbarui profil: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
