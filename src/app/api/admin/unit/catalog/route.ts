import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { CommodityType, SeedClass } from "@/types/database";

function getAllowedCommodity(user: { role: string; team_code?: string | null }): CommodityType | null {
  if (user.role === "admin_l2") {
    if (user.team_code === "upbs_padi") return "padi";
    if (user.team_code === "upbs_ayam") return "ayam";
  }
  return null;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = getAllowedCommodity(user);
  if (!allowed) {
    return NextResponse.json(
      { error: "Akses ditolak: Hanya untuk Petugas Unit UPBS Padi atau UPBS Ayam." },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();

  const query = supabase
    .from("varieties")
    .select(`
      id,
      code,
      name,
      seed_class,
      commodity_type,
      description,
      price_per_unit,
      unit,
      image_url,
      is_active,
      created_at,
      updated_at
    `)
    .eq("commodity_type", allowed)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const [varRes, batchRes] = await Promise.all([
    query,
    supabase
      .from("variety_batches")
      .select("id, variety_id, batch_number, initial_stock, current_stock, reserved_stock, expiry_date, created_at")
      .is("deleted_at", null)
      .order("expiry_date", { ascending: true }),
  ]);

  if (varRes.error) {
    return NextResponse.json({ error: varRes.error.message }, { status: 500 });
  }

  interface BatchData {
    id: string;
    variety_id: string;
    batch_number: string;
    initial_stock: number;
    current_stock: number;
    reserved_stock: number;
    expiry_date: string;
    created_at: string;
  }

  const nowStr = new Date().toISOString().split("T")[0];
  const batchesByVariety = new Map<string, BatchData[]>();

  ((batchRes.data || []) as BatchData[]).forEach((b) => {
    const list = batchesByVariety.get(b.variety_id) || [];
    list.push(b);
    batchesByVariety.set(b.variety_id, list);
  });

  const enriched = (varRes.data || []).map((v) => {
    const batches = batchesByVariety.get(v.id) || [];

    let netAvailableStock = 0;
    let totalReserved = 0;
    let totalCurrent = 0;

    batches.forEach((b) => {
      const c = Number(b.current_stock);
      const r = Number(b.reserved_stock);
      totalCurrent += c;
      totalReserved += r;
      if (b.expiry_date >= nowStr) {
        netAvailableStock += Math.max(0, c - r);
      }
    });

    return {
      ...v,
      batches,
      total_current_stock: totalCurrent,
      total_reserved_stock: totalReserved,
      net_available_stock: netAvailableStock,
    };
  });

  return NextResponse.json({
    varieties: enriched,
    userCommodity: allowed,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = getAllowedCommodity(user);
  if (!allowed) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, seed_class, commodity_type, description, price_per_unit, unit } = body;

    if (!name?.trim() || !commodity_type) {
      return NextResponse.json(
        { error: "Nama varietas dan jenis komoditas wajib diisi." },
        { status: 400 }
      );
    }

    // Enforce commodity boundary for unit officer
    if (commodity_type !== allowed) {
      return NextResponse.json(
        { error: `Unit Anda hanya berwenang mendaftarkan komoditas ${allowed.toUpperCase()}.` },
        { status: 403 }
      );
    }

    const cleanCode = `VAR-${commodity_type.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;
    const supabase = createAdminClient();

    const { data: newVar, error: insertErr } = await supabase
      .from("varieties")
      .insert({
        code: cleanCode,
        name: name.trim(),
        seed_class: (seed_class as SeedClass) || "NONE",
        commodity_type: commodity_type as CommodityType,
        description: description?.trim() || null,
        price_per_unit: Number(price_per_unit) || 0,
        unit: unit?.trim() || (commodity_type === "padi" ? "kg" : "ekor"),
        is_active: true,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Varietas baru berhasil ditambahkan.",
      variety: newVar,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
