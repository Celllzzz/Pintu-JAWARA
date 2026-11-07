import { createAdminClient } from "@/lib/supabase/admin";

export interface StockAllocation {
  batchId: string;
  batchNumber: string;
  heldAmount: number;
  expiryDate: string;
}

export interface HoldStockResult {
  success: boolean;
  totalHeld: number;
  shortage: number;
  allocations: StockAllocation[];
  commodityType?: "padi" | "ayam";
  unit?: string;
  warning?: string;
}

/**
 * Holds stock for UPBS Padi or UPBS Ayam following FEFO principle (earliest expiry first).
 */
export async function holdUPBSStock(
  varietyId: string,
  quantityNeeded: number
): Promise<HoldStockResult> {
  const supabase = createAdminClient();
  const nowStr = new Date().toISOString().split("T")[0];

  // 1. Fetch variety metadata
  const { data: variety } = await supabase
    .from("varieties")
    .select("name, commodity_type, unit")
    .eq("id", varietyId)
    .single();

  // 2. Fetch available batches ordered by expiry_date ASC (FEFO)
  const { data: batches, error } = await supabase
    .from("variety_batches")
    .select("id, batch_number, current_stock, reserved_stock, expiry_date")
    .eq("variety_id", varietyId)
    .is("deleted_at", null)
    .gte("expiry_date", nowStr)
    .order("expiry_date", { ascending: true });

  if (error || !batches) {
    return {
      success: false,
      totalHeld: 0,
      shortage: quantityNeeded,
      allocations: [],
      commodityType: variety?.commodity_type,
      unit: variety?.unit,
      warning: "Gagal mengambil data batch stok varietas.",
    };
  }

  let remainingToHold = quantityNeeded;
  let totalHeld = 0;
  const allocations: StockAllocation[] = [];

  for (const batch of batches) {
    if (remainingToHold <= 0) break;

    const available = Number(batch.current_stock) - Number(batch.reserved_stock);
    if (available <= 0) continue;

    const toHold = Math.min(available, remainingToHold);
    const newReserved = Number(batch.reserved_stock) + toHold;

    // Optimistic concurrency locking: verify reserved_stock has not mutated concurrently
    const { data: updatedRows, error: updateErr } = await supabase
      .from("variety_batches")
      .update({
        reserved_stock: newReserved,
        updated_at: new Date().toISOString(),
      })
      .eq("id", batch.id)
      .eq("reserved_stock", batch.reserved_stock)
      .select("id");

    if (!updateErr && updatedRows && updatedRows.length > 0) {
      allocations.push({
        batchId: batch.id,
        batchNumber: batch.batch_number,
        heldAmount: toHold,
        expiryDate: batch.expiry_date,
      });
      totalHeld += toHold;
      remainingToHold -= toHold;
    } else {
      // Concurrency retry: fetch fresh state for this batch
      const { data: freshBatch } = await supabase
        .from("variety_batches")
        .select("id, batch_number, current_stock, reserved_stock, expiry_date")
        .eq("id", batch.id)
        .single();

      if (freshBatch) {
        const freshAvailable = Number(freshBatch.current_stock) - Number(freshBatch.reserved_stock);
        if (freshAvailable > 0) {
          const freshToHold = Math.min(freshAvailable, remainingToHold);
          const freshNewReserved = Number(freshBatch.reserved_stock) + freshToHold;
          const { data: retryRows, error: retryErr } = await supabase
            .from("variety_batches")
            .update({
              reserved_stock: freshNewReserved,
              updated_at: new Date().toISOString(),
            })
            .eq("id", freshBatch.id)
            .eq("reserved_stock", freshBatch.reserved_stock)
            .select("id");

          if (!retryErr && retryRows && retryRows.length > 0) {
            allocations.push({
              batchId: freshBatch.id,
              batchNumber: freshBatch.batch_number,
              heldAmount: freshToHold,
              expiryDate: freshBatch.expiry_date,
            });
            totalHeld += freshToHold;
            remainingToHold -= freshToHold;
          }
        }
      }
    }
  }

  const shortage = Math.max(0, remainingToHold);
  let warning: string | undefined;

  if (shortage > 0) {
    warning = `Stok fisik kurang ${shortage} ${variety?.unit || "unit"}. Total tertahan: ${totalHeld} ${variety?.unit || "unit"}.`;
  }

  return {
    success: totalHeld > 0,
    totalHeld,
    shortage,
    allocations,
    commodityType: variety?.commodity_type,
    unit: variety?.unit,
    warning,
  };
}

/**
 * Releases held stock for UPBS Padi or UPBS Ayam (e.g. when returned to perlu_perbaikan).
 */
export async function releaseUPBSStock(
  varietyId: string,
  quantityToRelease: number
): Promise<number> {
  const supabase = createAdminClient();

  // Fetch batches with reserved_stock > 0
  const { data: batches } = await supabase
    .from("variety_batches")
    .select("id, reserved_stock, expiry_date")
    .eq("variety_id", varietyId)
    .gt("reserved_stock", 0)
    .order("expiry_date", { ascending: false });

  if (!batches || batches.length === 0) return 0;

  let remainingToRelease = quantityToRelease;
  let totalReleased = 0;

  for (const batch of batches) {
    if (remainingToRelease <= 0) break;

    const currentReserved = Number(batch.reserved_stock);
    const toRelease = Math.min(currentReserved, remainingToRelease);
    const newReserved = Math.max(0, currentReserved - toRelease);

    await supabase
      .from("variety_batches")
      .update({
        reserved_stock: newReserved,
        updated_at: new Date().toISOString(),
      })
      .eq("id", batch.id);

    totalReleased += toRelease;
    remainingToRelease -= toRelease;
  }

  return totalReleased;
}
