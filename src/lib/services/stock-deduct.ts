import { createAdminClient } from "@/lib/supabase/admin";

export interface StockDeduction {
  batchId: string;
  batchNumber: string;
  deductedAmount: number;
  remainingStock: number;
  expiryDate: string;
}

export interface DeductStockResult {
  success: boolean;
  totalDeducted: number;
  deductions: StockDeduction[];
  commodityType?: "padi" | "ayam";
  unit?: string;
  warning?: string;
}

/**
 * Permanently deducts stock for UPBS Padi or Ayam following FEFO when a ticket is completed.
 * Reduces current_stock and reserved_stock on the batch.
 */
export async function deductUPBSStock(
  varietyId: string,
  quantityToDeduct: number
): Promise<DeductStockResult> {
  const supabase = createAdminClient();

  // 1. Fetch variety metadata
  const { data: variety } = await supabase
    .from("varieties")
    .select("name, commodity_type, unit")
    .eq("id", varietyId)
    .single();

  // 2. Fetch batches ordered by expiry_date ASC (FEFO)
  const { data: batches, error } = await supabase
    .from("variety_batches")
    .select("id, batch_number, current_stock, reserved_stock, expiry_date")
    .eq("variety_id", varietyId)
    .is("deleted_at", null)
    .gt("current_stock", 0)
    .order("expiry_date", { ascending: true });

  if (error || !batches || batches.length === 0) {
    return {
      success: false,
      totalDeducted: 0,
      deductions: [],
      commodityType: variety?.commodity_type,
      unit: variety?.unit,
      warning: "Tidak ada batch stok yang tersedia untuk dipotong.",
    };
  }

  let remaining = quantityToDeduct;
  let totalDeducted = 0;
  const deductions: StockDeduction[] = [];

  for (const batch of batches) {
    if (remaining <= 0) break;

    const currentStock = Number(batch.current_stock);
    const reservedStock = Number(batch.reserved_stock);

    const toDeduct = Math.min(currentStock, remaining);
    const newCurrent = Math.max(0, currentStock - toDeduct);
    const newReserved = Math.max(0, reservedStock - toDeduct);

    const { data: updatedRows, error: updateErr } = await supabase
      .from("variety_batches")
      .update({
        current_stock: newCurrent,
        reserved_stock: newReserved,
        updated_at: new Date().toISOString(),
      })
      .eq("id", batch.id)
      .eq("current_stock", batch.current_stock)
      .select("id");

    if (!updateErr && updatedRows && updatedRows.length > 0) {
      deductions.push({
        batchId: batch.id,
        batchNumber: batch.batch_number,
        deductedAmount: toDeduct,
        remainingStock: newCurrent,
        expiryDate: batch.expiry_date,
      });
      totalDeducted += toDeduct;
      remaining -= toDeduct;
    }
  }

  const shortage = Math.max(0, remaining);
  let warning: string | undefined;

  if (shortage > 0) {
    warning = `Stok fisik kurang ${shortage} ${variety?.unit || "unit"}. Total berhasil dipotong: ${totalDeducted} ${variety?.unit || "unit"}.`;
  }

  return {
    success: totalDeducted > 0,
    totalDeducted,
    deductions,
    commodityType: variety?.commodity_type,
    unit: variety?.unit,
    warning,
  };
}
