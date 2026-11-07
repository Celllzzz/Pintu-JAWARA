import * as dotenv from "dotenv";
import * as path from "path";
import assert from "assert";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { createAdminClient } from "../src/lib/supabase/admin";

async function runUpbsCatalogTests() {
  console.log("=== RUNNING UPBS CATALOG MANAGEMENT TESTS ===");
  const supabase = createAdminClient();

  // 1. Verify UPBS Padi varieties exist
  console.log("[1/4] Checking UPBS Padi varieties...");
  const { data: padiVars } = await supabase
    .from("varieties")
    .select("id, name, code, commodity_type, is_active, price_per_unit")
    .eq("commodity_type", "padi")
    .is("deleted_at", null);

  assert(padiVars && padiVars.length >= 3, "Must have at least 3 padi varieties");
  console.log(`✓ UPBS Padi varieties found: ${padiVars.length} items.`);

  // 2. Verify UPBS Ayam varieties exist
  console.log("[2/4] Checking UPBS Ayam varieties...");
  const { data: ayamVars } = await supabase
    .from("varieties")
    .select("id, name, code, commodity_type, is_active, price_per_unit")
    .eq("commodity_type", "ayam")
    .is("deleted_at", null);

  assert(ayamVars && ayamVars.length >= 2, "Must have at least 2 ayam varieties");
  console.log(`✓ UPBS Ayam varieties found: ${ayamVars.length} items.`);

  // 3. Test Add Variety and Add Batch
  console.log("[3/4] Testing adding test variety and batch...");
  const testCode = `VAR-PAD-TEST-${Date.now().toString().slice(-4)}`;
  const { data: testVar, error: varErr } = await supabase
    .from("varieties")
    .insert({
      code: testCode,
      name: "Varietas Uji Coba Padi",
      seed_class: "SS",
      commodity_type: "padi",
      description: "Uji coba penambahan varietas mandiri oleh UPBS Padi.",
      price_per_unit: 12500,
      unit: "kg",
      is_active: true,
    })
    .select()
    .single();

  assert(!varErr && testVar, `Failed to create test variety: ${varErr?.message}`);

  const testBatchNum = `B-TEST-${Date.now().toString().slice(-4)}`;
  const { data: testBatch, error: batchErr } = await supabase
    .from("variety_batches")
    .insert({
      variety_id: testVar.id,
      batch_number: testBatchNum,
      initial_stock: 350,
      current_stock: 350,
      reserved_stock: 0,
      expiry_date: "2026-12-31",
    })
    .select()
    .single();

  assert(!batchErr && testBatch, `Failed to create test batch: ${batchErr?.message}`);
  assert(testBatch.current_stock === 350, "Batch stock must be 350");
  console.log(`✓ Test variety & batch created: ${testVar.name} (${testBatch.batch_number}).`);

  // 4. Test Toggle Status Tampil (is_active)
  console.log("[4/4] Testing toggling is_active status...");
  await supabase
    .from("varieties")
    .update({ is_active: false })
    .eq("id", testVar.id);

  const { data: updatedVar } = await supabase
    .from("varieties")
    .select("is_active")
    .eq("id", testVar.id)
    .single();

  assert(updatedVar?.is_active === false, "is_active must be toggled to false");
  console.log("✓ Status toggling verified.");

  // Cleanup
  await supabase.from("variety_batches").delete().eq("variety_id", testVar.id);
  await supabase.from("varieties").delete().eq("id", testVar.id);
  console.log("✓ Test variety and batch cleaned up.");

  console.log("\nALL UPBS CATALOG MANAGEMENT TESTS PASSED SUCCESSFULLY!");
}

runUpbsCatalogTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
