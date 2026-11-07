import * as dotenv from "dotenv";
import * as path from "path";
import assert from "assert";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import {
  buildWhatsAppMessage,
  getMockWhatsAppInstance,
  sendWhatsAppNotification,
  WhatsAppEvent,
} from "../src/lib/services/whatsapp";
import { GenericHttpWhatsAppAdapter } from "../src/lib/services/whatsapp/adapters/generic-http";
import { createAdminClient } from "../src/lib/supabase/admin";
import { generateUniqueTicketNumber } from "../src/lib/services/ticket-number";

async function runNotificationTests() {
  console.log("=== RUNNING WHATSAPP NOTIFICATION TESTS ===");

  const sampleData = {
    ticketNumber: "SL-BS-948231",
    applicantName: "H. Ahmad Fauzi",
    whatsappNumber: "081234567890",
    serviceName: "Penyediaan Benih & Bibit Sumber",
    teamName: "Unit Pengelola Benih Sumber Padi",
    notes: "KTP buram, harap perbaiki.",
    amount: 300000,
    bankName: "Bank Mandiri",
    accountNumber: "163-00-1234567-8",
    accountHolder: "BPPTP Banten (BRMP)",
    pinLast4: "7890",
  };

  // 1. Test All 7 Template Formats
  console.log("[1/4] Testing all 7 WhatsApp message templates...");
  const events: WhatsAppEvent[] = [
    "pengajuan_baru",
    "perlu_perbaikan",
    "disposisi",
    "diproses",
    "tagihan_baru",
    "bukti_bayar_ditolak",
    "layanan_selesai",
  ];

  for (const ev of events) {
    const text = buildWhatsAppMessage(ev, sampleData);
    assert(text.includes("PINTU JAWARA - BRMP BANTEN"), `Header missing in ${ev}`);
    assert(text.includes(sampleData.ticketNumber), `Ticket number missing in ${ev}`);
    assert(text.includes(sampleData.applicantName), `Applicant name missing in ${ev}`);
    assert(text.includes("/lacak?ticket="), `Track link missing in ${ev}`);
  }

  // Specific template assertion checks
  const tagihanMsg = buildWhatsAppMessage("tagihan_baru", sampleData);
  assert(tagihanMsg.includes("300.000"), "Tagihan nominal format check");
  assert(tagihanMsg.includes(sampleData.accountNumber), "Bank account check");

  const selesaiMsg = buildWhatsAppMessage("layanan_selesai", sampleData);
  assert(selesaiMsg.includes("Survei Kepuasan Masyarakat"), "Survei prompt check");

  console.log("✓ All 7 official templates generated and verified.");

  // 2. Test Mock WhatsApp Adapter
  console.log("[2/4] Testing Mock WhatsApp Adapter...");
  const mock = getMockWhatsAppInstance();
  mock.clearLogs();

  const sendResult = await mock.send(sampleData.whatsappNumber, "Test Mock Notification");
  assert(sendResult.success === true, "Mock send must succeed");
  assert(sendResult.provider === "mock", "Provider name must be mock");
  assert(mock.getSentMessages().length === 1, "Mock log must store 1 message");
  assert(mock.getSentMessages()[0].phone === sampleData.whatsappNumber, "Phone must match");
  console.log("✓ Mock WhatsApp Adapter verified.");

  // 3. Test Generic HTTP Adapter Error Resilience
  console.log("[3/4] Testing Generic HTTP Adapter error resilience...");
  const dummyHttp = new GenericHttpWhatsAppAdapter({
    apiUrl: "http://127.0.0.1:9999/invalid",
    apiKey: "dummy-key",
    timeoutMs: 1000,
  });

  const failureResult = await dummyHttp.send(sampleData.whatsappNumber, "Test Message");
  assert(failureResult.success === false, "Failed network call must return success: false without throwing");
  assert(failureResult.provider === "generic-http", "Provider must be generic-http");
  assert(Boolean(failureResult.error), "Must contain error message");
  console.log(`✓ HTTP adapter graceful fallback verified (Error: ${failureResult.error}).`);

  // 4. Test Notification Dispatch & Non-blocking Audit Logging
  console.log("[4/4] Testing dispatch with ticket audit logging...");
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

  const testTicketNum = await generateUniqueTicketNumber("BS");
  const { data: testTicket, error: tErr } = await supabase
    .from("tickets")
    .insert({
      ticket_number: testTicketNum,
      category_id: cat.id,
      sub_service_id: sub.id,
      applicant_name: "Test Notifikasi Pemohon",
      whatsapp_number: "081299998888",
      whatsapp_pin_last4: "8888",
      subject: "Uji Notifikasi WhatsApp",
      description: "Pengujian dispatch otomatis WhatsApp gateway.",
      status: "diajukan",
      sla_days: cat.sla_days,
    })
    .select("id")
    .single();

  assert(!tErr && testTicket, `Ticket creation failed: ${tErr?.message}`);

  const dispatchResult = await sendWhatsAppNotification("pengajuan_baru", {
    ticketNumber: testTicketNum,
    applicantName: "Test Notifikasi Pemohon",
    whatsappNumber: "081299998888",
    serviceName: "Penyediaan Benih & Bibit Sumber",
    pinLast4: "8888",
  });

  assert(dispatchResult.success === true, "Dispatch via mock must succeed");

  // Verify audit log does NOT record notification
  const { data: logs } = await supabase
    .from("ticket_audit_logs")
    .select("action, notes")
    .eq("ticket_id", testTicket.id)
    .eq("action", "kirim_notifikasi_wa");

  assert(!logs || logs.length === 0, "Audit log must not record WA notification per user rule");
  console.log(`✓ Audit log verified: no WA notifications recorded.`);

  // Cleanup test ticket
  await supabase.from("tickets").delete().eq("id", testTicket.id);
  console.log("✓ Test ticket cleaned up.");

  console.log("\nALL WHATSAPP NOTIFICATION TESTS PASSED SUCCESSFULLY!");
}

runNotificationTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
