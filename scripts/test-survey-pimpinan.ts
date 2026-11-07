import * as dotenv from "dotenv";
import * as path from "path";
import assert from "assert";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { calculateIKM, submitSurvey } from "../src/lib/services/survey";
import {
  getLiveKPIMetrics,
  getOverdueTickets,
  getReport8ColumnData,
  formatExportTimestamp,
} from "../src/lib/services/pimpinan";
import { generateUniqueTicketNumber } from "../src/lib/services/ticket-number";
import { createAdminClient } from "../src/lib/supabase/admin";

async function runSurveyPimpinanTests() {
  console.log("=== RUNNING SURVEY & PIMPINAN DASHBOARD TESTS ===");
  const supabase = createAdminClient();

  // 1. Test IKM Calculation
  console.log("[1/5] Testing IKM calculation formula...");
  const perfectAnswers = Array(16).fill(4);
  const perfectResult = calculateIKM(perfectAnswers);
  assert(perfectResult.averageScore === 4.0, "Average must be 4.0");
  assert(perfectResult.ikmScore === 100.0, "IKM must be 100.0");
  assert(perfectResult.serviceGrade === "A", "Grade must be A");

  const goodAnswers = [3, 4, 3, 4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 4, 4, 4];
  const goodResult = calculateIKM(goodAnswers);
  assert(goodResult.ikmScore >= 88.31, "Should be Grade A");

  const lowAnswers = Array(16).fill(2);
  const lowResult = calculateIKM(lowAnswers);
  assert(lowResult.ikmScore === 50.0, "IKM must be 50.0");
  assert(lowResult.serviceGrade === "D", "Grade must be D");
  console.log(`✓ IKM Formula verified. Perfect: ${perfectResult.ikmScore} (${perfectResult.serviceGrade}), Low: ${lowResult.ikmScore} (${lowResult.serviceGrade})`);

  // 2. Test Timestamp Formatter
  console.log("[2/5] Testing export timestamp formatter...");
  const ts = formatExportTimestamp();
  assert(ts.includes("WIB"), "Timestamp must contain WIB");
  assert(ts.includes("Pukul"), "Timestamp must contain Pukul");
  console.log(`✓ Formatted Timestamp: ${ts}`);

  // 3. Test Survey Submission Lifecycle
  console.log("[3/5] Testing survey submission on completed ticket...");
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
  assert(sub, "Sub-service must exist");

  const testTicketNum = await generateUniqueTicketNumber("BS");

  // Create completed ticket
  const { data: testTicket, error: tErr } = await supabase
    .from("tickets")
    .insert({
      ticket_number: testTicketNum,
      category_id: cat.id,
      sub_service_id: sub.id,
      applicant_name: "Responden Uji SKM",
      whatsapp_number: "081298765432",
      whatsapp_pin_last4: "5432",
      subject: "Pengujian Survei SKM Otomatis",
      description: "Uji kelayakan alur kuesioner dan pembukaan kunci unduh.",
      status: "selesai",
      completed_at: new Date().toISOString(),
      sla_days: cat.sla_days,
    })
    .select("id")
    .single();

  assert(!tErr && testTicket, `Ticket creation failed: ${tErr?.message}`);

  // Submit Survey
  const surveyRes = await submitSurvey({
    ticket_id: testTicket.id,
    contact_number: "081298765432",
    service_type: "UPBS Padi",
    gender: "Laki-Laki",
    education: "D4/S1",
    age_range: "26 - 34 Tahun",
    occupation: "Petani/Nelayan",
    is_disabled: false,
    q1: 4,
    q2: 4,
    q3: 4,
    q4: 4,
    q5: 4,
    q6: 4,
    q7: 4,
    q8: 4,
    q9: 4,
    q10: 4,
    q11: 4,
    q12: 4,
    q13: 4,
    q14: 4,
    q15: 4,
    q16: 4,
    feedback: "Pelayanan sangat memuaskan dan responsif.",
  });

  assert(surveyRes.success === true, `Survey submission failed: ${surveyRes.error}`);
  assert(surveyRes.calculation?.ikmScore === 100, "IKM score must be 100");
  console.log(`✓ Survey submitted successfully for ${testTicketNum}. Score: ${surveyRes.calculation?.ikmScore}`);

  // 4. Test Live KPI Metrics
  console.log("[4/5] Testing live KPI metrics aggregation...");
  const metrics = await getLiveKPIMetrics();
  assert(typeof metrics.totalTickets === "number", "totalTickets must be number");
  assert(typeof metrics.completedTickets === "number", "completedTickets must be number");
  assert(metrics.currentIKM !== null, "currentIKM must be computed");
  assert(metrics.totalSurveys >= 1, "totalSurveys must be at least 1");
  console.log(`✓ Live KPI: Total=${metrics.totalTickets}, Selesai=${metrics.completedTickets}, IKM=${metrics.currentIKM} (${metrics.currentGrade}), Surveys=${metrics.totalSurveys}`);

  // 5. Test 8-Column Report Data
  console.log("[5/5] Testing 8-column official report query...");
  const reportRows = await getReport8ColumnData({ range: "all", categoryCode: "all" });
  assert(reportRows.length >= 1, "Must return at least 1 row");

  const sampleRow = reportRows.find((r) => r.nomor_e_tiket === testTicketNum);
  assert(sampleRow, "Test ticket must be in 8-column report");
  assert(sampleRow.nama_pemohon === "Responden Uji SKM", "Applicant name must match");
  assert(sampleRow.tanggal_pengajuan.length > 0, "tanggal_pengajuan must not be empty");
  assert(sampleRow.tanggal_penyelesaian !== "—", "Completed ticket must have tanggal_penyelesaian");
  console.log(`✓ 8-Column Report Row verified:`, sampleRow);

  // Cleanup test ticket & survey
  await supabase.from("surveys").delete().eq("ticket_id", testTicket.id);
  await supabase.from("tickets").delete().eq("id", testTicket.id);
  console.log("✓ Test ticket & survey cleaned up.");

  console.log("\nALL SURVEY & PIMPINAN TESTS PASSED SUCCESSFULLY!");
}

runSurveyPimpinanTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
