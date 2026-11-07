import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { SeedClass, Database } from "@/types/database";

type VarietyUpdate = Database["public"]["Tables"]["varieties"]["Update"];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: varietyId } = await params;
  const body = await req.json();

  const supabase = createAdminClient();

  // 1. Fetch current variety to check commodity authority
  const { data: currentVar, error: fetchErr } = await supabase
    .from("varieties")
    .select("id, commodity_type")
    .eq("id", varietyId)
    .is("deleted_at", null)
    .single();

  if (fetchErr || !currentVar) {
    return NextResponse.json({ error: "Varietas tidak ditemukan." }, { status: 404 });
  }

  // 2. Check authority: if admin_l2, check team
  if (user.role === "admin_l2") {
    if (
      (currentVar.commodity_type === "padi" && user.team_code !== "upbs_padi") ||
      (currentVar.commodity_type === "ayam" && user.team_code !== "upbs_ayam")
    ) {
      return NextResponse.json(
        { error: "Akses ditolak: Varietas ini bukan wewenang unit Anda." },
        { status: 403 }
      );
    }
  } else if (user.role !== "admin_l1") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  // 3. Build update payload
  const updatePayload: VarietyUpdate = {
    updated_at: new Date().toISOString(),
  };

  if (typeof body.name === "string" && body.name.trim()) {
    updatePayload.name = body.name.trim();
  }
  if (body.seed_class !== undefined) {
    updatePayload.seed_class = (body.seed_class as SeedClass) || "NONE";
  }
  if (body.price_per_unit !== undefined) {
    updatePayload.price_per_unit = Number(body.price_per_unit) || 0;
  }
  if (body.description !== undefined) {
    updatePayload.description = body.description ? String(body.description).trim() : null;
  }
  if (typeof body.is_active === "boolean") {
    updatePayload.is_active = body.is_active;
  }

  const { data: updated, error: updateErr } = await supabase
    .from("varieties")
    .update(updatePayload)
    .eq("id", varietyId)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Data varietas berhasil diperbarui.",
    variety: updated,
  });
}
