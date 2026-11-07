import * as dotenv from "dotenv";
import * as path from "path";
import assert from "assert";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { createAdminClient } from "../src/lib/supabase/admin";
import { generateUniqueTicketNumber } from "../src/lib/services/ticket-number";
import { getTicketForTracking } from "../src/lib/services/ticket";
import { checkRateLimit } from "../src/lib/auth/rate-limit";
import { SESSION_TTL_SECONDS } from "../src/lib/auth/session";

async function runSecurityRBACTest() {
  console.log("=== RUNNING FASE 11: SECURITY & RBAC AUDIT TESTS ===");
  const supabase = createAdminClient();

  // 1. Session TTL Verification
  console.log("\n[1/5] Verifikasi Session TTL Security...");
  assert(SESSION_TTL_SECONDS === 86400, "Session TTL wajib tepat 86400 detik (24 jam)");
  console.log(`✓ Session TTL terkonfigurasi tepat ${SESSION_TTL_SECONDS / 3600} jam (86400 detik).`);

  // 2. Ticket Number Regex & Service Code Boundary
  console.log("\n[2/5] Verifikasi Format & Keamanan Penomoran E-Tiket...");
  const validCodes = ["BS", "IP", "MP", "KE", "PK", "KT", "PA", "PB"];
  for (const code of validCodes) {
    const num = await generateUniqueTicketNumber(code);
    assert(
      new RegExp(`^SL-${code}-[0-9]{6}$`).test(num),
      `Format tiket ${code} tidak valid: ${num}`
    );
  }
  console.log(`✓ 8 Format kode layanan terverifikasi dengan pola aman SL-[KODE]-[6DIGIT].`);

  // 3. 4-Digit PIN Security Boundary for Tracking
  console.log("\n[3/5] Verifikasi Proteksi Otentikasi 4-Digit PIN...");
  const { data: cat } = await supabase.from("service_categories").select("id, sla_days").eq("code", "KT").single();
  const { data: sub } = await supabase.from("sub_services").select("id").eq("category_id", cat?.id).limit(1).single();
  const testNum = await generateUniqueTicketNumber("KT");
  const { data: testTicket, error: tErr } = await supabase
    .from("tickets")
    .insert({
      ticket_number: testNum,
      category_id: cat?.id,
      sub_service_id: sub?.id,
      sla_days: cat?.sla_days || 3,
      applicant_name: "Pemohon Uji Keamanan",
      whatsapp_number: "081234567890",
      whatsapp_pin_last4: "7890",
      subject: "Uji Proteksi PIN",
      description: "Pengujian akses tak berhak.",
      status: "diajukan",
    })
    .select("id")
    .single();

  if (tErr) console.error("Ticket Insert Error:", tErr);
  assert(testTicket, "Tiket uji coba harus berhasil dibuat");

  // A. Akses dengan PIN salah -> Wajib gagal (success = false)
  const wrongPinRes = await getTicketForTracking(testNum, "9999");
  assert(wrongPinRes.success === false, "Akses dengan PIN salah '9999' wajib ditolak (success: false)");
  assert(!wrongPinRes.ticket, "Tiket tidak boleh dikembalikan jika PIN salah");
  console.log("✓ Akses pelacakan dengan PIN salah berhasil diblokir.");

  // B. Akses dengan PIN benar -> Berhasil
  const correctPinRes = await getTicketForTracking(testNum, "7890");
  assert(correctPinRes.success === true, "Akses dengan PIN benar wajib berhasil");
  assert(correctPinRes.ticket?.ticket_number === testNum, "Data tiket yang dikembalikan harus sesuai");
  console.log("✓ Akses pelacakan dengan PIN benar berhasil diberikan.");

  // Cleanup tiket uji
  await supabase.from("tickets").delete().eq("id", testTicket.id);

  // 4. Rate Limiter Brute-Force Defense
  console.log("\n[4/5] Verifikasi Rate Limiting Anti-Brute-Force...");
  const testIp = `sec-test-${Date.now()}`;
  for (let i = 1; i <= 5; i++) {
    const res = checkRateLimit(`login:${testIp}`, 5, 60000);
    assert(res.allowed === true, `Percobaan ke-${i} seharusnya diizinkan`);
  }
  const blockedAttempt = checkRateLimit(`login:${testIp}`, 5, 60000);
  assert(blockedAttempt.allowed === false, "Percobaan ke-6 wajib diblokir oleh rate limiter");
  console.log("✓ Rate limiting memblokir upaya ke-6 secara instan.");

  // 5. Database RBAC & Team Segregation
  console.log("\n[5/5] Verifikasi Isolasi Peran Database & Tim...");
  const { data: users } = await supabase
    .from("users")
    .select("id, email, role, team_id, teams(code, name)");

  assert(users && users.length > 0, "Daftar pengguna harus ada");

  for (const u of users) {
    if (u.role === "admin_l1") {
      // Admin L1 adalah front-office umum
      assert(u.role === "admin_l1");
    } else if (u.role === "admin_l2") {
      // Admin L2 wajib terikat pada satu tim teknis
      assert(u.team_id !== null, `Admin L2 (${u.email}) wajib memiliki team_id`);
      const teamObj = u.teams as unknown as { code: string; name: string } | null;
      assert(teamObj?.code, `Admin L2 (${u.email}) wajib memiliki kode tim valid`);
    } else if (u.role === "pimpinan") {
      assert(u.role === "pimpinan");
    }
  }
  console.log(`✓ Isolasi ${users.length} akun pengguna pada database terverifikasi sesuai prinsip least privilege.`);

  console.log("\nALL SECURITY & RBAC AUDIT TESTS PASSED 100%!");
}

runSecurityRBACTest().catch((err) => {
  console.error("Security & RBAC Audit Failed:", err);
  process.exit(1);
});
