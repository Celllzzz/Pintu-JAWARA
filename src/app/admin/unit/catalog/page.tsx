import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { CatalogManagementView } from "@/components/admin-unit/catalog/CatalogManagementView";
import { VarietyItem } from "@/components/admin-unit/catalog/VarietyEditModal";

export default async function UnitCatalogManagementPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let userCommodity: "padi" | "ayam" | null = null;
  if (user.role === "admin_l2") {
    if (user.team_code === "upbs_padi") userCommodity = "padi";
    else if (user.team_code === "upbs_ayam") userCommodity = "ayam";
  }

  if (!userCommodity) {
    return (
      <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-8 text-center text-xs text-[#92400e] space-y-2">
        <h2 className="text-base font-bold text-[#191c19]">Wewenang Khusus Petugas Unit UPBS</h2>
        <p className="max-w-md mx-auto">
          Halaman pengelolaan stok dan katalog hanya dapat diakses oleh Petugas Unit UPBS Padi atau Petugas Unit UPBS Ayam.
        </p>
      </div>
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
    .eq("commodity_type", userCommodity)
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

  const varieties = varRes.data || [];
  const batchesData = (batchRes.data || []) as BatchData[];

  const nowStr = new Date().toISOString().split("T")[0];
  const batchesByVariety = new Map<string, BatchData[]>();

  batchesData.forEach((b) => {
    const list = batchesByVariety.get(b.variety_id) || [];
    list.push(b);
    batchesByVariety.set(b.variety_id, list);
  });

  const enriched: VarietyItem[] = varieties.map((v) => {
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
      id: v.id,
      code: v.code,
      name: v.name,
      seed_class: v.seed_class,
      commodity_type: v.commodity_type,
      description: v.description,
      price_per_unit: Number(v.price_per_unit),
      unit: v.unit,
      is_active: v.is_active,
      total_current_stock: totalCurrent,
      total_reserved_stock: totalReserved,
      net_available_stock: netAvailableStock,
      batches,
    };
  });

  return (
    <CatalogManagementView
      initialVarieties={enriched}
      userCommodity={userCommodity}
      teamName={user.team_name || null}
    />
  );
}
