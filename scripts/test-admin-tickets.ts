import * as dotenv from "dotenv";
import * as path from "path";
import assert from "assert";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { holdUPBSStock, releaseUPBSStock } from "../src/lib/services/stock-hold";
import { generateUniqueTicketNumber } from "../src/lib/services/ticket-number";
import { createAdminClient } from "../src/lib/supabase/admin";

async function runAdminTicketsTest() {
  console.log("=== RUNNING ADMIN WORKSPACE & STOCK HOLD TESTS ===");
  const supabase = createAdminClient();

  // 1. Check Variety for Padi
  console.log("[1/6] Finding UPBS Padi variety...");
  const { data: padiVar } = await supabase
    .from("varieties")
    .select("id, name, commodity_type, unit")
    .eq("commodity_type", "padi")
    .limit(1)
    .single();
  assert(padiVar, "UPBS Padi variety must exist");
  console.log(`✓ Variety: ${padiVar.name} (${padiVar.unit})`);

  // 2. Check Variety for Ayam
  console.log("[2/6] Finding UPBS Ayam variety...");
  const { data: ayamVar } = await supabase
    .from("varieties")
    .select("id, name, commodity_type, unit")
    .eq("commodity_type", "ayam")
    .limit(1)
    .single();
  assert(ayamVar, "UPBS Ayam variety must exist");
  console.log(`✓ Variety: ${ayamVar.name} (${ayamVar.unit})`);

  // 3. Test Hold Stock for Padi
  console.log("[3/6] Testing hold stock for Padi (10 kg)...");
  const padiHoldRes = await holdUPBSStock(padiVar.id, 10);
  assert(padiHoldRes.success === true, "Padi stock hold must succeed");
  assert(padiHoldRes.totalHeld === 10, "Should hold 10 kg");
  console.log(`✓ Held 10 kg Padi. Allocations:`, padiHoldRes.allocations);

  // Release it
  const padiReleased = await releaseUPBSStock(padiVar.id, 10);
  assert(padiReleased === 10, "Should release 10 kg");
  console.log(`✓ Released 10 kg Padi.`);

  // 4. Test Hold Stock for Ayam
  console.log("[4/6] Testing hold stock for Ayam (5 ekor)...");
  const ayamHoldRes = await holdUPBSStock(ayamVar.id, 5);
  assert(ayamHoldRes.success === true, "Ayam stock hold must succeed");
  assert(ayamHoldRes.totalHeld === 5, "Should hold 5 ekor");
  console.log(`✓ Held 5 ekor Ayam. Allocations:`, ayamHoldRes.allocations);

  // Release it
  const ayamReleased = await releaseUPBSStock(ayamVar.id, 5);
  assert(ayamReleased === 5, "Should release 5 ekor");
  console.log(`✓ Released 5 ekor Ayam.`);

  // 5. Test Verification & Disposisi flow on a test ticket
  console.log("[5/6] Creating test ticket for end-to-end admin verification...");
  const { data: cat } = await supabase
    .from("service_categories")
    .select("id, code, sla_days")
    .eq("code", "BS")
    .single();
  assert(cat, "BS category must exist");

  const { data: sub } = await supabase
    .from("sub_services")
    .select("id")
    .eq("category_id", cat.id)
    .limit(1)
    .single();
  assert(sub, "Sub service must exist");

  const testTicketNum = await generateUniqueTicketNumber("BS");
  const { data: testTicket, error: insertErr } = await supabase
    .from("tickets")
    .insert({
      ticket_number: testTicketNum,
      category_id: cat.id,
      sub_service_id: sub.id,
      applicant_name: "Test Admin Verifikasi",
      whatsapp_number: "081234567890",
      whatsapp_pin_last4: "7890",
      subject: "Uji Verifikasi & Disposisi",
      description: "Pengujian flow lengkap admin workspace.",
      status: "diajukan",
      mechanism: "komersial",
      variety_id: padiVar.id,
      requested_quantity: 20,
      sla_days: cat.sla_days,
    })
    .select("id, status, version")
    .single();

  assert(!insertErr && testTicket, `Ticket insert failed: ${insertErr?.message}`);

  // Hold stock on verify
  const holdOnVerify = await holdUPBSStock(padiVar.id, 20);
  assert(holdOnVerify.success, "Hold on verify must succeed");

  await supabase
    .from("tickets")
    .update({ status: "diverifikasi", version: testTicket.version + 1 })
    .eq("id", testTicket.id);

  // 6. Test Disposisi to a team
  console.log("[6/6] Testing disposisi to 1 team...");
  const { data: team } = await supabase
    .from("teams")
    .select("id, name")
    .eq("code", "upbs_padi")
    .single();
  assert(team, "Team upbs_padi must exist");

  const { error: dispErr } = await supabase
    .from("tickets")
    .update({ status: "disposisi", team_id: team.id })
    .eq("id", testTicket.id);
  assert(!dispErr, "Disposisi must succeed");

  // Release test stock and cleanup ticket
  await releaseUPBSStock(padiVar.id, 20);
  await supabase.from("tickets").delete().eq("id", testTicket.id);

  console.log("✓ Test ticket verified, disposed, and cleaned up.");
  console.log("\nALL ADMIN WORKSPACE & STOCK HOLD TESTS PASSED SUCCESSFULLY!");
}

runAdminTicketsTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
