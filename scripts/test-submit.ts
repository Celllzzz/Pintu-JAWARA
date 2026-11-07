import * as dotenv from "dotenv";
import * as path from "path";
import assert from "assert";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { generateUniqueTicketNumber } from "../src/lib/services/ticket-number";
import { getActiveVarieties } from "../src/lib/services/catalog";
import { createAdminClient } from "../src/lib/supabase/admin";

async function runSubmitTests() {
  console.log("=== RUNNING SUBMIT & CATALOG TESTS ===");

  // 1. Ticket Number Generator
  console.log("[1/4] Testing e-ticket number generator...");
  const ticketBs = await generateUniqueTicketNumber("BS");
  assert(ticketBs.startsWith("SL-BS-"), "Must start with SL-BS-");
  assert(ticketBs.length === 12, `Length must be 12 (SL-BS-XXXXXX), got ${ticketBs}`);

  const ticketIp = await generateUniqueTicketNumber("IP");
  assert(ticketIp.startsWith("SL-IP-"), "Must start with SL-IP-");
  console.log(`✓ Generated ticket numbers: ${ticketBs}, ${ticketIp}`);

  // 2. Active Varieties & Batches
  console.log("[2/4] Testing getActiveVarieties service...");
  const varieties = await getActiveVarieties();
  assert(varieties.length >= 4, "Should have at least 4 seeded varieties");

  const cakrabuana = varieties.find((v) => v.code === "VAR-CKB-SS");
  assert(cakrabuana, "Cakrabuana SS must exist");
  assert(cakrabuana.total_stock >= 1000, "Cakrabuana stock must be >= 1000");
  assert(cakrabuana.stock_status === "tersedia", "Stock status must be 'tersedia'");

  const ayamPullet = varieties.find((v) => v.code === "VAR-AYAM-DARA");
  assert(ayamPullet, "Ayam Dara must exist");
  assert(ayamPullet.stock_status === "tanyakan_stok", "Ayam Dara status must be 'tanyakan_stok'");
  console.log(`✓ Loaded ${varieties.length} varieties with accurate stock.`);

  // 3. Test Full Ticket Insertion with Audit Log
  console.log("[3/4] Testing ticket creation flow in Supabase...");
  const supabase = createAdminClient();

  const { data: cat } = await supabase
    .from("service_categories")
    .select("id, code, sla_days")
    .eq("code", "BS")
    .single();
  assert(cat, "Category BS must exist");

  const { data: sub } = await supabase
    .from("sub_services")
    .select("id")
    .eq("category_id", cat.id)
    .limit(1)
    .single();
  assert(sub, "Sub service must exist");

  const testPhone = "0812-9876-4321";
  const pinLast4 = testPhone.replace(/\D/g, "").slice(-4);
  assert(pinLast4 === "4321", "Extracted pin must be 4321");

  const newTicketNum = await generateUniqueTicketNumber(cat.code);

  const { data: insertedTicket, error: tErr } = await supabase
    .from("tickets")
    .insert({
      ticket_number: newTicketNum,
      category_id: cat.id,
      sub_service_id: sub.id,
      applicant_name: "Kelompok Tani Harapan Jaya",
      whatsapp_number: testPhone,
      whatsapp_pin_last4: pinLast4,
      subject: "Pemesanan Benih Cakrabuana",
      description: "Pengujian pemesanan benih melalui modul form pengajuan.",
      status: "diajukan",
      mechanism: "komersial",
      variety_id: cakrabuana.id,
      requested_quantity: 50,
      estimated_cost: 50 * cakrabuana.price_per_unit,
      sla_days: cat.sla_days,
    })
    .select("id")
    .single();

  assert(!tErr && insertedTicket, `Failed to create ticket: ${tErr?.message}`);

  // Insert audit log
  const { error: logErr } = await supabase.from("ticket_audit_logs").insert({
    ticket_id: insertedTicket.id,
    action: "pengajuan_baru",
    old_status: null,
    new_status: "diajukan",
    actor_type: "pemohon",
    actor_name: "Kelompok Tani Harapan Jaya",
    notes: "Pengajuan permohonan baru dari form publik",
  });
  assert(!logErr, `Failed to insert audit log: ${logErr?.message}`);

  console.log(`✓ Test ticket & audit log created: ${newTicketNum}`);

  // 4. Verify & Cleanup
  console.log("[4/4] Verifying ticket audit log...");
  const { data: logs } = await supabase
    .from("ticket_audit_logs")
    .select("id, action")
    .eq("ticket_id", insertedTicket.id);

  assert(logs && logs.length === 1, "Audit log must exist");
  assert(logs[0].action === "pengajuan_baru", "Action must be pengajuan_baru");

  await supabase.from("tickets").delete().eq("id", insertedTicket.id);
  console.log("✓ Test ticket cleaned up.");

  console.log("\nALL SUBMIT & CATALOG TESTS PASSED SUCCESSFULLY!");
}

runSubmitTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
