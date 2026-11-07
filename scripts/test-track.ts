import * as dotenv from "dotenv";
import * as path from "path";
import assert from "assert";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import {
  calculateWorkingDaysDeadline,
  countRemainingWorkingDays,
  getHolidaysSet,
  getTicketForTracking,
} from "../src/lib/services/ticket";
import { createAdminClient } from "../src/lib/supabase/admin";

async function runTrackingTests() {
  console.log("=== RUNNING TICKET TRACKING & SLA TESTS ===");

  // 1. Holiday set check
  console.log("[1/4] Checking holidays in database...");
  const holidaySet = await getHolidaysSet();
  assert(holidaySet.size >= 10, "Should have 2026 holidays loaded");
  assert(holidaySet.has("2026-08-17"), "2026-08-17 (HUT RI) must be a holiday");
  console.log(`✓ Holidays loaded: ${holidaySet.size} dates.`);

  // 2. Working days SLA calculation
  console.log("[2/4] Testing working days SLA calculation...");
  // Start on Friday 2026-08-14, 3 working days SLA.
  // Sat 15 (skip), Sun 16 (skip), Mon 17 (holiday - skip), Tue 18 (1), Wed 19 (2), Thu 20 (3)
  const startFri = new Date("2026-08-14T08:00:00Z");
  const deadline = calculateWorkingDaysDeadline(startFri, 3, holidaySet);
  assert(deadline.toISOString().startsWith("2026-08-20"), "Deadline must land on 2026-08-20");

  const remaining = countRemainingWorkingDays(startFri, deadline, holidaySet);
  assert(remaining.remainingDays === 3, "Remaining working days should be 3");
  assert(remaining.isOverdue === false, "Should not be overdue");
  console.log("✓ SLA working days & holiday exclusion calculation PASSED.");

  // 3. Create mock ticket in Supabase
  console.log("[3/4] Creating test ticket in Supabase...");
  const supabase = createAdminClient();

  const { data: cat } = await supabase
    .from("service_categories")
    .select("id")
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

  const testTicketNumber = `SL-BS-${Date.now().toString().slice(-6)}`;
  const testPin = "9876";

  const { data: newTicket, error: insertErr } = await supabase
    .from("tickets")
    .insert({
      ticket_number: testTicketNumber,
      category_id: cat.id,
      sub_service_id: sub.id,
      applicant_name: "Kelompok Tani Uji Mandiri",
      whatsapp_number: "081234569876",
      whatsapp_pin_last4: testPin,
      subject: "Uji Coba Pengajuan Benih Padi",
      description: "Permohonan pengujian modul pelacakan tiket.",
      status: "diajukan",
      sla_days: 5,
    })
    .select("id")
    .single();

  assert(!insertErr && newTicket, `Ticket insert failed: ${insertErr?.message}`);
  console.log(`✓ Test ticket created: ${testTicketNumber} (${newTicket.id})`);

  // 4. Test tracking query
  console.log("[4/4] Testing getTicketForTracking service...");
  // Wrong PIN test
  const wrongPinRes = await getTicketForTracking(testTicketNumber, "0000");
  assert(wrongPinRes.success === false, "Wrong PIN must fail");

  // Correct PIN test
  const correctRes = await getTicketForTracking(testTicketNumber, testPin);
  assert(correctRes.success === true, "Correct PIN must succeed");
  assert(correctRes.ticket?.ticket_number === testTicketNumber, "Ticket number must match");
  assert(correctRes.ticket?.applicant_name === "Kelompok Tani Uji Mandiri", "Applicant must match");
  assert(correctRes.ticket?.category?.code === "BS", "Category code must match BS");
  assert(correctRes.ticket?.sla.slaDays === 5, "SLA days must be 5");
  console.log("✓ Tracking query & verification PASSED.");

  // Cleanup test ticket
  await supabase.from("tickets").delete().eq("id", newTicket.id);
  console.log("✓ Test ticket cleaned up.");

  console.log("\nALL TICKET TRACKING & SLA TESTS PASSED SUCCESSFULLY!");
}

runTrackingTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
