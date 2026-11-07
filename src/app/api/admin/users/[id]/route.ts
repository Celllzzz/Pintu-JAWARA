import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/auth/password";
import { UserRole, Database } from "@/types/database";

type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin_l1") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { full_name, phone_number, role, team_id, is_active, reset_password } =
      await req.json();

    const updatePayload: UserUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (full_name) updatePayload.full_name = full_name.trim();
    if (phone_number !== undefined) updatePayload.phone_number = phone_number?.trim() || null;
    if (is_active !== undefined) updatePayload.is_active = Boolean(is_active);

    if (role) {
      const validRoles: UserRole[] = ["admin_l1", "admin_l2", "pimpinan"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Peran tidak valid." }, { status: 400 });
      }
      updatePayload.role = role;
      if (role === "admin_l2") {
        if (!team_id) {
          return NextResponse.json(
            { error: "Petugas Unit wajib memilih Tim Penanganan." },
            { status: 400 }
          );
        }
        updatePayload.team_id = team_id;
      } else {
        updatePayload.team_id = null;
      }
    }

    if (reset_password) {
      const plainPassword = reset_password.trim() || "Admin123";
      updatePayload.password_hash = await hashPassword(plainPassword);
    }

    const supabase = createAdminClient();
    const { error: updateError } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", id)
      .is("deleted_at", null);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (is_active === false) {
      await supabase.from("user_sessions").delete().eq("user_id", id);
    }

    return NextResponse.json({
      success: true,
      message: "Data petugas berhasil diperbarui.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin_l1") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id } = await params;

  if (id === currentUser.id) {
    return NextResponse.json(
      { error: "Tidak dapat menghapus akun Anda sendiri." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { error: deleteError } = await supabase
    .from("users")
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  await supabase.from("user_sessions").delete().eq("user_id", id);

  return NextResponse.json({
    success: true,
    message: "Akun petugas berhasil dihapus.",
  });
}
