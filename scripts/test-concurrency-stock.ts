import * as dotenv from "dotenv";
import * as path from "path";
import assert from "assert";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { createAdminClient } from "../src/lib/supabase/admin";
import { holdUPBSStock, releaseUPBSStock } from "../src/lib/services/stock-hold";
import { deductUPBSStock } from "../src/lib/services/stock-deduct";

async function runStockConcurrencyTest() {
  console.log("=== RUNNING FASE 11: STOCK CONCURRENCY & INTEGRITY TESTS ===");
  const supabase = createAdminClient();

  // 1. Setup isolated test variety with exact 10 kg stock
  console.log("\n[1/4] Membuat varietas & batch uji terisolasi (Stok: 10 kg)...");
  const testCode = `CONC-${Date.now().toString().slice(-6)}`;
  const { data: testVar, error: varErr } = await supabase
    .from("varieties")
    .insert({
      code: testCode,
      name: `Uji Konkurensi Varietas ${testCode}`,
      commodity_type: "padi",
      seed_class: "SS",
      price_per_unit: 12000,
      unit: "kg",
      is_active: true,
    })
    .select("id")
    .single();

  assert(!varErr && testVar, "Varietas uji harus berhasil dibuat");

  const expiryInFuture = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const { data: testBatch, error: batchErr } = await supabase
    .from("variety_batches")
    .insert({
      variety_id: testVar.id,
      batch_number: `B-${testCode}-01`,
      initial_stock: 10,
      current_stock: 10,
      reserved_stock: 0,
      expiry_date: expiryInFuture,
    })
    .select("id")
    .single();

  if (batchErr) console.error("Batch Err:", batchErr);
  assert(!batchErr && testBatch, "Batch uji harus berhasil dibuat");
  console.log(`✓ Varietas & Batch uji dibuat: ${testCode} (Stok: 10 kg).`);

  // 2. Concurrency Simulation: Dua permintaan simultan masing-masing butuh 7 kg (Total 14 kg > 10 kg)
  console.log("\n[2/4] Menjalankan simulasi penahanan stok bersamaan (Req A: 7 kg, Req B: 7 kg)...");
  const [resA, resB] = await Promise.all([
    holdUPBSStock(testVar.id, 7),
    holdUPBSStock(testVar.id, 7),
  ]);

  console.log(`  - Respon Permintaan A: held=${resA.totalHeld}, shortage=${resA.shortage}`);
  console.log(`  - Respon Permintaan B: held=${resB.totalHeld}, shortage=${resB.shortage}`);

  // Total held antara A dan B tidak boleh melebihi stok fisik 10 kg
  const totalHeldCombined = resA.totalHeld + resB.totalHeld;
  assert(
    totalHeldCombined <= 10,
    `Pelanggaran integritas stok! Total tertahan (${totalHeldCombined}) melebihi stok fisik (10).`
  );
  console.log(`✓ Total stok tertahan (${totalHeldCombined} kg) terkontrol secara aman <= 10 kg.`);

  // Cek kondisi batch di database
  const { data: batchState } = await supabase
    .from("variety_batches")
    .select("current_stock, reserved_stock")
    .eq("id", testBatch.id)
    .single();

  assert(batchState, "Batch state harus ada");
  const available = Number(batchState.current_stock) - Number(batchState.reserved_stock);
  assert(
    available >= 0,
    `Stok tersedia tidak boleh negatif! Didapat: ${available}`
  );
  console.log(`✓ Status batch di DB: Current=${batchState.current_stock}, Reserved=${batchState.reserved_stock}, Sisa Tersedia=${available} (Non-Negatif).`);

  // 3. Pelepasan Stok (Release)
  console.log("\n[3/4] Menguji pelepasan stok tertahan (Release)...");
  const released = await releaseUPBSStock(testVar.id, totalHeldCombined);
  assert(released === totalHeldCombined, "Seluruh stok tertahan harus berhasil dilepas");

  const { data: batchAfterRelease } = await supabase
    .from("variety_batches")
    .select("reserved_stock")
    .eq("id", testBatch.id)
    .single();
  assert(Number(batchAfterRelease?.reserved_stock) === 0, "Reserved stock harus kembali 0");
  console.log("✓ Seluruh stok tertahan berhasil dilepaskan, reserved_stock kembali 0.");

  // 4. Pengujian Batas Pemotongan (Over-deduction prevention)
  console.log("\n[4/4] Menguji pencegahan pemotongan melebihi stok fisik...");
  // Hold 10 kg dulu
  await holdUPBSStock(testVar.id, 10);
  // Coba potong 15 kg (lebih besar dari 10 kg)
  const overDeductRes = await deductUPBSStock(testVar.id, 15);
  // Hanya maksimal 10 kg yang boleh terpotong
  assert(
    overDeductRes.totalDeducted <= 10,
    `Pemotongan melebihi stok fisik! Terpotong: ${overDeductRes.totalDeducted}`
  );
  console.log(`✓ Sistem mencegah pemotongan berlebih. Maksimal terpotong: ${overDeductRes.totalDeducted} kg.`);

  // Cleanup Data Uji
  await supabase.from("variety_batches").delete().eq("variety_id", testVar.id);
  await supabase.from("varieties").delete().eq("id", testVar.id);
  console.log("✓ Data uji varietas dan batch dibersihkan.");

  console.log("\nALL STOCK CONCURRENCY & INTEGRITY TESTS PASSED 100%!");
}

runStockConcurrencyTest().catch((err) => {
  console.error("Stock Concurrency Test Failed:", err);
  process.exit(1);
});
