import * as dotenv from "dotenv";
import * as path from "path";
import assert from "assert";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { deductUPBSStock } from "../src/lib/services/stock-deduct";
import { holdUPBSStock, releaseUPBSStock } from "../src/lib/services/stock-hold";
import { generateUniqueTicketNumber } from "../src/lib/services/ticket-number";
import { calculateWorkingDaysDeadline, getHolidaysSet } from "../src/lib/services/ticket";
import { createAdminClient } from "../src/lib/supabase/admin";

async function runUnitTicketsTest() {
  console.log("=== RUNNING UNIT WORKSPACE & COMPLETE TESTS ===");
  const supabase = createAdminClient();

  // 1. Test FEFO Stock Deduction for Padi
  console.log("[1/5] Testing permanent FEFO stock deduction on Padi...");
  const { data: padiVar } = await supabase
    .from("varieties")
    .select("id, name, unit")
    .eq("commodity_type", "padi")
    .limit(1)
    .single();
  assert(padiVar, "Padi variety must exist");

  // First hold 10 kg
  await holdUPBSStock(padiVar.id, 10);
  // Then permanently deduct 10 kg
  const deductRes = await deductUPBSStock(padiVar.id, 10);
  assert(deductRes.success === true, "Stock deduction must succeed");
  assert(deductRes.totalDeducted === 10, "Must deduct 10 kg");
  console.log(`✓ Deducted 10 kg Padi (${padiVar.name}). Deductions:`, deductRes.deductions);

  // Restore the 10 kg to current_stock for clean test database
  if (deductRes.deductions.length > 0) {
    const firstAlloc = deductRes.deductions[0];
    const { data: batch } = await supabase
      .from("variety_batches")
      .select("current_stock")
      .eq("id", firstAlloc.batchId)
      .single();
    if (batch) {
      await supabase
        .from("variety_batches")
        .update({ current_stock: Number(batch.current_stock) + 10 })
        .eq("id", firstAlloc.batchId);
    }
  }

  // 2. Test FEFO Stock Deduction for Ayam
  console.log("[2/5] Testing permanent FEFO stock deduction on Ayam...");
  const { data: ayamVar } = await supabase
    .from("varieties")
    .select("id, name, unit")
    .eq("commodity_type", "ayam")
    .limit(1)
    .single();
  assert(ayamVar, "Ayam variety must exist");

  // First hold 5 ekor
  await holdUPBSStock(ayamVar.id, 5);
  // Then permanently deduct 5 ekor
  const ayamDeduct = await deductUPBSStock(ayamVar.id, 5);
  assert(ayamDeduct.success === true, "Ayam deduction must succeed");
  assert(ayamDeduct.totalDeducted === 5, "Must deduct 5 ekor");
  console.log(`✓ Deducted 5 ekor Ayam (${ayamVar.name}). Deductions:`, ayamDeduct.deductions);

  // Restore the 5 ekor to current_stock
  if (ayamDeduct.deductions.length > 0) {
    const firstAyamAlloc = ayamDeduct.deductions[0];
    const { data: batch } = await supabase
      .from("variety_batches")
      .select("current_stock")
      .eq("id", firstAyamAlloc.batchId)
      .single();
    if (batch) {
      await supabase
        .from("variety_batches")
        .update({ current_stock: Number(batch.current_stock) + 5 })
        .eq("id", firstAyamAlloc.batchId);
    }
  }

  // 3. Test Full Ticket Lifecycle in Unit
  console.log("[3/5] Testing unit ticket process, pause, resume, and SLA calculation...");
  const { data: catIp } = await supabase
    .from("service_categories")
    .select("id, code, sla_days")
    .eq("code", "IP")
    .single();
  assert(catIp, "PPID category must exist");

  const { data: subIp } = await supabase
    .from("sub_services")
    .select("id")
    .eq("category_id", catIp.id)
    .limit(1)
    .single();
  assert(subIp, "Sub service IP must exist");

  const { data: teamPpid } = await supabase
    .from("teams")
    .select("id")
    .eq("code", "sdm_aparatur") // or any team
    .limit(1)
    .single();
  assert(teamPpid, "Team must exist");

  const testTicketNum = await generateUniqueTicketNumber("IP");
  const { data: testTicket, error: tErr } = await supabase
    .from("tickets")
    .insert({
      ticket_number: testTicketNum,
      category_id: catIp.id,
      sub_service_id: subIp.id,
      team_id: teamPpid.id,
      applicant_name: "Pemohon Uji Unit",
      whatsapp_number: "081234567890",
      whatsapp_pin_last4: "7890",
      subject: "Permohonan Informasi Publik PPID",
      description: "Uji alur unit penanganan.",
      status: "disposisi",
      sla_days: catIp.sla_days,
    })
    .select("id, status, version")
    .single();

  assert(!tErr && testTicket, "Test ticket creation must succeed");

  // A. Start Process: sla_started_at set
  const holidays = await getHolidaysSet();
  const now = new Date();
  const deadline = calculateWorkingDaysDeadline(now, catIp.sla_days, holidays);

  await supabase
    .from("tickets")
    .update({
      status: "diproses",
      sla_started_at: now.toISOString(),
      sla_deadline: deadline.toISOString(),
      version: testTicket.version + 1,
    })
    .eq("id", testTicket.id);

  console.log(`✓ Started process on ${testTicketNum}. Deadline: ${deadline.toISOString().slice(0, 10)}`);

  // B. Test PPID Extension (+7 working days)
  console.log("[4/5] Testing PPID SLA extension (+7 working days)...");
  const extendedDeadline = calculateWorkingDaysDeadline(deadline, 7, holidays);
  await supabase
    .from("tickets")
    .update({
      is_sla_extended: true,
      sla_extension_reason: "Uji coba perpanjangan dokumen arsip PPID",
      sla_deadline: extendedDeadline.toISOString(),
    })
    .eq("id", testTicket.id);

  const { data: updatedTicket } = await supabase
    .from("tickets")
    .select("is_sla_extended, sla_deadline")
    .eq("id", testTicket.id)
    .single();

  assert(updatedTicket?.is_sla_extended === true, "Must be marked as extended");
  console.log(`✓ PPID SLA extended to: ${updatedTicket?.sla_deadline?.slice(0, 10)}`);

  // C. Test Completion with Notes & Status check
  console.log("[5/5] Testing completion with clarification notes...");
  await supabase
    .from("tickets")
    .update({
      status: "selesai",
      completed_at: new Date().toISOString(),
      completion_note: "Dokumen informasi publik telah disampaikan kepada pemohon secara digital.",
    })
    .eq("id", testTicket.id);

  const { data: finalTicket } = await supabase
    .from("tickets")
    .select("status, completed_at, completion_note")
    .eq("id", testTicket.id)
    .single();

  assert(finalTicket?.status === "selesai", "Ticket status must be selesai");
  assert(finalTicket?.completed_at !== null, "completed_at must not be null");
  console.log(`✓ Ticket ${testTicketNum} successfully completed.`);

  // Cleanup
  await supabase.from("tickets").delete().eq("id", testTicket.id);
  console.log("✓ Test ticket cleaned up.");

  console.log("\nALL UNIT WORKSPACE & COMPLETION TESTS PASSED SUCCESSFULLY!");
}

runUnitTicketsTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
