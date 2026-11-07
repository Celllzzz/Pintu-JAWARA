import { createAdminClient } from "@/lib/supabase/admin";
import { SeedClass, CommodityType } from "@/types/database";

export type StockStatus = "tersedia" | "terbatas" | "tanyakan_stok" | "habis";

export interface CatalogVarietyItem {
  id: string;
  code: string;
  name: string;
  seed_class: SeedClass | null;
  commodity_type: CommodityType;
  description: string | null;
  price_per_unit: number;
  unit: string;
  image_url: string | null;
  is_active: boolean;
  total_stock: number;
  earliest_expiry: string | null;
  stock_status: StockStatus;
}

export async function getActiveVarieties(): Promise<CatalogVarietyItem[]> {
  const supabase = createAdminClient();

  const [varRes, batchRes] = await Promise.all([
    supabase
      .from("varieties")
      .select("id, code, name, seed_class, commodity_type, description, price_per_unit, unit, image_url, is_active")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("commodity_type", { ascending: true })
      .order("name", { ascending: true }),

    supabase
      .from("variety_batches")
      .select("id, variety_id, current_stock, reserved_stock, expiry_date")
      .is("deleted_at", null),
  ]);

  if (varRes.error || !varRes.data) {
    return [];
  }

  const nowStr = new Date().toISOString().split("T")[0];
  const batchesByVariety = new Map<string, Array<{ current: number; reserved: number; expiry: string }>>();

  (batchRes.data || []).forEach((b) => {
    if (b.expiry_date >= nowStr && Number(b.current_stock) > Number(b.reserved_stock)) {
      const list = batchesByVariety.get(b.variety_id) || [];
      list.push({
        current: Number(b.current_stock),
        reserved: Number(b.reserved_stock),
        expiry: b.expiry_date,
      });
      batchesByVariety.set(b.variety_id, list);
    }
  });

  return varRes.data.map((v) => {
    const activeBatches = batchesByVariety.get(v.id) || [];

    let totalStock = 0;
    let earliestExpiry: string | null = null;

    activeBatches.forEach((b) => {
      const net = Math.max(0, b.current - b.reserved);
      totalStock += net;
      if (!earliestExpiry || b.expiry < earliestExpiry) {
        earliestExpiry = b.expiry;
      }
    });

    let stockStatus: StockStatus = "tanyakan_stok";
    if (activeBatches.length === 0) {
      stockStatus = "tanyakan_stok";
    } else if (totalStock > 50) {
      stockStatus = "tersedia";
    } else if (totalStock > 0) {
      stockStatus = "terbatas";
    } else {
      stockStatus = "habis";
    }

    return {
      id: v.id,
      code: v.code,
      name: v.name,
      seed_class: v.seed_class as SeedClass | null,
      commodity_type: v.commodity_type as CommodityType,
      description: v.description,
      price_per_unit: Number(v.price_per_unit),
      unit: v.unit,
      image_url: v.image_url,
      is_active: v.is_active,
      total_stock: totalStock,
      earliest_expiry: earliestExpiry,
      stock_status: stockStatus,
    };
  });
}
