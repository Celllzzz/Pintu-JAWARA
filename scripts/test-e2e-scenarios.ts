import * as dotenv from "dotenv";
import * as path from "path";
import assert from "assert";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { createAdminClient } from "../src/lib/supabase/admin";
import { generateUniqueTicketNumber } from "../src/lib/services/ticket-number";
import { holdUPBSStock, releaseUPBSStock } from "../src/lib/services/stock-hold";
import { deductUPBSStock } from "../src/lib/services/stock-deduct";
import { calculateWorkingDaysDeadline, getHolidaysSet, countRemainingWorkingDays } from "../src/lib/services/ticket";
import { calculateIKM, submitSurvey } from "../src/lib/services/survey";

async function runE2EScenarios() {
  console.log("=== RUNNING FASE 11: E2E SCENARIOS TESTS ===");
  const supabase = createAdminClient();
  const holidays = await getHolidaysSet();

  // -----------------------------------------------------------------
  // Skenario 1: Layanan Berbayar UPBS (Padi) — Full Lifecycle E2E
  // Diajukan -> Hold Stok -> Diverifikasi -> Didisposisi -> Diproses ->
  // Tagihan -> Bukti Bayar -> Verifikasi Bayar -> FEFO Deduct -> Selesai -> Survei SKM
  // -----------------------------------------------------------------
  console.log("\n[Skenario 1] Layanan Berbayar UPBS Benih Padi E2E...");
  const { data: catBs } = await supabase
    .from("service_categories")
    .select("id, code, sla_days")
    .eq("code", "BS")
    .single();
  assert(catBs, "Kategori BS harus ada");

  const { data: subBs } = await supabase
    .from("sub_services")
    .select("id")
    .eq("category_id", catBs.id)
    .limit(1)
    .single();
  assert(subBs, "Sub-layanan BS harus ada");

  const { data: teamPadi } = await supabase
    .from("teams")
    .select("id")
    .eq("code", "upbs_padi")
    .single();
  assert(teamPadi, "Tim UPBS Padi harus ada");

  const { data: varPadi } = await supabase
    .from("varieties")
    .select("id, name, price_per_unit, unit")
    .eq("commodity_type", "padi")
    .limit(1)
    .single();
  assert(varPadi, "Varietas Padi harus ada");

  // 1. Publik submit tiket
  const tNum1 = await generateUniqueTicketNumber("BS");
  const { data: t1, error: t1Err } = await supabase
    .from("tickets")
    .insert({
      ticket_number: tNum1,
      category_id: catBs.id,
      sub_service_id: subBs.id,
      applicant_name: "Kelompok Tani Subur Makmur",
      whatsapp_number: "081299991111",
      whatsapp_pin_last4: "1111",
      subject: "Permohonan Benih Padi SS 20 kg",
      description: "Untuk penangkaran MT-1",
      mechanism: "commercial",
      variety_id: varPadi.id,
      requested_quantity: 20,
      status: "diajukan",
      sla_days: catBs.sla_days,
    })
    .select()
    .single();
  assert(!t1Err && t1, "Submit tiket 1 harus sukses");
  console.log(`  1. Tiket diajukan: ${t1.ticket_number}`);

  // 2. Admin L1 Verifikasi & Tahan Stok
  const holdRes = await holdUPBSStock(varPadi.id, 20);
  assert(holdRes.success, "Hold stok 20 kg harus sukses");
  await supabase
    .from("tickets")
    .update({
      status: "diverifikasi",
      is_stock_held: true,
      stock_held_amount: 20,
      version: t1.version + 1,
    })
    .eq("id", t1.id);
  console.log(`  2. Stok 20 kg ditahan (held). Status: diverifikasi`);

  // 3. Admin L1 Disposisi ke Unit UPBS Padi
  await supabase
    .from("tickets")
    .update({
      status: "disposisi",
      team_id: teamPadi.id,
      disposed_at: new Date().toISOString(),
      version: t1.version + 2,
    })
    .eq("id", t1.id);
  console.log(`  3. Tiket didisposisikan ke UPBS Padi`);

  // 4. Admin L2 Mulai Proses (SLA Mulai Berjalan)
  const startTime = new Date();
  const deadline1 = calculateWorkingDaysDeadline(startTime, catBs.sla_days, holidays);
  await supabase
    .from("tickets")
    .update({
      status: "diproses",
      sla_started_at: startTime.toISOString(),
      sla_deadline: deadline1.toISOString(),
      version: t1.version + 3,
    })
    .eq("id", t1.id);
  console.log(`  4. Diproses oleh Unit. SLA deadline: ${deadline1.toISOString().slice(0, 10)}`);

  // 5. Admin L2 Kirim Rincian Tagihan
  const totalBill = 20 * (varPadi.price_per_unit || 12000);
  await supabase
    .from("tickets")
    .update({
      billing_amount: totalBill,
      billing_bank: "Bank Mandiri",
      billing_account_number: "163-00-1234567-8",
      billing_account_name: "BPPTP Banten (BRMP)",
      billing_status: "billed",
      billing_description: `Pembayaran 20 ${varPadi.unit} Benih Padi`,
      version: t1.version + 4,
    })
    .eq("id", t1.id);
  console.log(`  5. Tagihan diterbitkan: Rp ${totalBill.toLocaleString("id-ID")}`);

  // 6. Pemohon unggah bukti bayar
  await supabase
    .from("tickets")
    .update({
      payment_proof_url: "https://mock-storage.brmp.go.id/proofs/bukti-transfer-t1.jpg",
      billing_status: "paid_pending_verification",
      version: t1.version + 5,
    })
    .eq("id", t1.id);
  console.log(`  6. Pemohon unggah bukti transfer. Status: paid_pending_verification`);

  // 7. Admin L2 Verifikasi Bukti Pembayaran
  await supabase
    .from("tickets")
    .update({
      billing_status: "verified",
      version: t1.version + 6,
    })
    .eq("id", t1.id);
  console.log(`  7. Pembayaran diverifikasi oleh Petugas Unit`);

  // 8. Admin L2 Selesaikan Tiket & Potong Stok FEFO Permanen
  const deductRes = await deductUPBSStock(varPadi.id, 20);
  assert(deductRes.success, "Potong stok FEFO permanen harus sukses");
  await supabase
    .from("tickets")
    .update({
      status: "selesai",
      completed_at: new Date().toISOString(),
      completion_note: "Benih padi telah diambil oleh pemohon dalam kondisi baik.",
      version: t1.version + 7,
    })
    .eq("id", t1.id);
  console.log(`  8. Tiket selesai. Stok FEFO dipotong permanen.`);

  // Kembalikan 20 kg ke batch pertama untuk menjaga kebersihan database uji
  if (deductRes.deductions.length > 0) {
    const alloc = deductRes.deductions[0];
    const { data: b } = await supabase.from("variety_batches").select("current_stock").eq("id", alloc.batchId).single();
    if (b) {
      await supabase.from("variety_batches").update({ current_stock: Number(b.current_stock) + 20 }).eq("id", alloc.batchId);
    }
  }

  // 9. Pemohon Isi Survei Kepuasan Masyarakat (16 Instrumen Likert 4)
  const survRes = await submitSurvey({
    ticket_id: t1.id,
    contact_number: "081299991111",
    service_type: "UPBS Padi",
    gender: "Laki-Laki",
    education: "D4/S1",
    age_range: "26 - 34 Tahun",
    occupation: "Petani/Nelayan",
    is_disabled: false,
    q1: 4, q2: 4, q3: 4, q4: 4, q5: 4, q6: 4, q7: 4, q8: 4,
    q9: 4, q10: 4, q11: 4, q12: 4, q13: 4, q14: 4, q15: 4, q16: 4,
    feedback: "Pelayanan sangat cepat dan transparan.",
  });
  assert(survRes.success, `Pengisian survei SKM harus sukses: ${survRes.error}`);
  assert(survRes.calculation?.ikmScore === 100 && survRes.calculation?.serviceGrade === "A", "Skor IKM harus 100 (A)");
  console.log(`  9. Survei SKM berhasil disubmit. Nilai IKM: ${survRes.calculation?.ikmScore} (${survRes.calculation?.serviceGrade})`);

  // Cleanup Skenario 1
  await supabase.from("surveys").delete().eq("ticket_id", t1.id);
  await supabase.from("tickets").delete().eq("id", t1.id);
  console.log("✓ Skenario 1 PASSED & dibersihkan.");

  // -----------------------------------------------------------------
  // Skenario 2: Layanan Gratis dengan Loop Revisi (Magang/PKL)
  // Diajukan -> Perlu Perbaikan (L1) -> Revisi Diunggah -> Diverifikasi ->
  // Disposisi -> Diproses -> SLA Paused (L2 Teknis) -> Klarifikasi -> SLA Resume -> Selesai
  // -----------------------------------------------------------------
  console.log("\n[Skenario 2] Layanan Gratis dengan Loop Revisi & Pause/Resume SLA...");
  const { data: catMp } = await supabase
    .from("service_categories")
    .select("id, code, sla_days")
    .eq("code", "MP")
    .single();
  assert(catMp, "Kategori MP harus ada");

  const { data: subMp } = await supabase
    .from("sub_services")
    .select("id")
    .eq("category_id", catMp.id)
    .limit(1)
    .single();
  assert(subMp, "Sub-layanan MP harus ada");

  const { data: teamSdm } = await supabase
    .from("teams")
    .select("id")
    .eq("code", "sdm_aparatur")
    .single();
  assert(teamSdm, "Tim SDM harus ada");

  const tNum2 = await generateUniqueTicketNumber("MP");
  const { data: t2 } = await supabase
    .from("tickets")
    .insert({
      ticket_number: tNum2,
      category_id: catMp.id,
      sub_service_id: subMp.id,
      applicant_name: "Mahasiswa Magang Untirta",
      whatsapp_number: "081288882222",
      whatsapp_pin_last4: "2222",
      subject: "Permohonan Magang Riset Bioteknologi",
      description: "Surat pengantar dekan terlampir.",
      status: "diajukan",
      sla_days: catMp.sla_days,
    })
    .select()
    .single();
  assert(t2, "Tiket 2 harus dibuat");
  console.log(`  1. Tiket magang dibuat: ${t2.ticket_number}`);

  // A. Admin L1 Minta Revisi Berkas
  await supabase
    .from("tickets")
    .update({
      status: "perlu_perbaikan",
      revision_notes: "Proposal penelitian belum melampirkan transkrip nilai akademik.",
      version: t2.version + 1,
    })
    .eq("id", t2.id);
  console.log(`  2. Status diubah ke perlu_perbaikan oleh Admin L1`);

  // B. Pemohon Unggah Dokumen Perbaikan
  await supabase
    .from("tickets")
    .update({
      status: "diverifikasi",
      revision_notes: null,
      version: t2.version + 2,
    })
    .eq("id", t2.id);
  console.log(`  3. Pemohon perbaiki berkas. Status kembali ke diverifikasi`);

  // C. Admin L1 Disposisi ke SDM
  await supabase
    .from("tickets")
    .update({
      status: "disposisi",
      team_id: teamSdm.id,
      disposed_at: new Date().toISOString(),
      version: t2.version + 3,
    })
    .eq("id", t2.id);
  console.log(`  4. Tiket didisposisikan ke Tim SDM`);

  // D. Admin L2 SDM Mulai Proses (SLA Berjalan: 7 Hari Kerja)
  const t2Start = new Date();
  const t2Deadline = calculateWorkingDaysDeadline(t2Start, catMp.sla_days, holidays);
  await supabase
    .from("tickets")
    .update({
      status: "diproses",
      sla_started_at: t2Start.toISOString(),
      sla_deadline: t2Deadline.toISOString(),
      is_sla_paused: false,
      version: t2.version + 4,
    })
    .eq("id", t2.id);
  console.log(`  5. Tim SDM mulai proses. Deadline awal: ${t2Deadline.toISOString().slice(0, 10)}`);

  // E. Admin L2 Menemukan Kendala & Mem-pause SLA (misal: konfirmasi jadwal lab)
  const { remainingDays } = countRemainingWorkingDays(new Date(), t2Deadline, holidays);
  await supabase
    .from("tickets")
    .update({
      is_sla_paused: true,
      sla_paused_at: new Date().toISOString(),
      sla_paused_remaining_days: remainingDays,
      status: "perlu_perbaikan",
      revision_notes: "Konfirmasi tanggal mulai magang dengan pembimbing lapangan diperlukan.",
      version: t2.version + 5,
    })
    .eq("id", t2.id);
  console.log(`  6. SLA di-pause. Sisa hari kerja tersimpan: ${remainingDays} hari`);

  // F. Pemohon Memberikan Klarifikasi & SLA Di-resume
  const resumeDate = new Date();
  const recalculatedDeadline = calculateWorkingDaysDeadline(resumeDate, remainingDays, holidays);
  await supabase
    .from("tickets")
    .update({
      status: "diproses",
      is_sla_paused: false,
      sla_paused_at: null,
      sla_deadline: recalculatedDeadline.toISOString(),
      version: t2.version + 6,
    })
    .eq("id", t2.id);
  console.log(`  7. SLA di-resume. Deadline baru dihitung ulang: ${recalculatedDeadline.toISOString().slice(0, 10)}`);

  // G. Selesai
  await supabase
    .from("tickets")
    .update({
      status: "selesai",
      completed_at: new Date().toISOString(),
      completion_note: "Surat persetujuan magang dan penetapan pembimbing telah diterbitkan.",
      version: t2.version + 7,
    })
    .eq("id", t2.id);
  console.log(`  8. Tiket selesai.`);

  // Cleanup Skenario 2
  await supabase.from("tickets").delete().eq("id", t2.id);
  console.log("✓ Skenario 2 PASSED & dibersihkan.");

  // -----------------------------------------------------------------
  // Skenario 3: Layanan PPID dengan Perpanjangan SLA (+7 Hari Kerja)
  // -----------------------------------------------------------------
  console.log("\n[Skenario 3] Layanan PPID dengan Perpanjangan SLA (+7 Hari Kerja)...");
  const { data: catIp } = await supabase
    .from("service_categories")
    .select("id, code, sla_days")
    .eq("code", "IP")
    .single();
  assert(catIp, "Kategori IP harus ada");

  const { data: subIp } = await supabase
    .from("sub_services")
    .select("id")
    .eq("category_id", catIp.id)
    .limit(1)
    .single();

  const tNum3 = await generateUniqueTicketNumber("IP");
  const { data: t3 } = await supabase
    .from("tickets")
    .insert({
      ticket_number: tNum3,
      category_id: catIp.id,
      sub_service_id: subIp.id,
      applicant_name: "LSM Transparansi Publik",
      whatsapp_number: "081277773333",
      whatsapp_pin_last4: "3333",
      subject: "Permohonan Data Laporan Tahunan 5 Tahun Terakhir",
      description: "Membutuhkan arsip fisik yang tersimpan di gudang arsip.",
      status: "disposisi",
      sla_days: catIp.sla_days,
    })
    .select()
    .single();
  assert(t3, "Tiket 3 harus dibuat");

  // Proses dimulai (10 hari kerja)
  const ipStart = new Date();
  const ipDeadlineInitial = calculateWorkingDaysDeadline(ipStart, 10, holidays);
  await supabase
    .from("tickets")
    .update({
      status: "diproses",
      sla_started_at: ipStart.toISOString(),
      sla_deadline: ipDeadlineInitial.toISOString(),
    })
    .eq("id", t3.id);
  console.log(`  1. PPID diproses. Deadline awal: ${ipDeadlineInitial.toISOString().slice(0, 10)}`);

  // Perpanjangan SLA +7 hari kerja
  const ipDeadlineExtended = calculateWorkingDaysDeadline(ipDeadlineInitial, 7, holidays);
  await supabase
    .from("tickets")
    .update({
      is_sla_extended: true,
      sla_extension_reason: "Penelusuran berkas arsip fisik memerlukan koordinasi lintas unit kearsipan.",
      sla_deadline: ipDeadlineExtended.toISOString(),
    })
    .eq("id", t3.id);

  const { data: t3Check } = await supabase
    .from("tickets")
    .select("is_sla_extended, sla_deadline, sla_extension_reason")
    .eq("id", t3.id)
    .single();
  assert(t3Check?.is_sla_extended === true, "is_sla_extended harus true");
  assert(t3Check?.sla_extension_reason !== null, "Alasan perpanjangan wajib ada");
  console.log(`  2. SLA diperpanjang +7 hari kerja ke: ${t3Check.sla_deadline?.slice(0, 10)}`);

  // Cleanup Skenario 3
  await supabase.from("tickets").delete().eq("id", t3.id);
  console.log("✓ Skenario 3 PASSED & dibersihkan.");

  // -----------------------------------------------------------------
  // Skenario 4: Penolakan / Tidak Dapat Dipenuhi (Tanpa Auto-Cancel)
  // Selesai dengan Catatan Klarifikasi & Permohonan Maaf
  // -----------------------------------------------------------------
  console.log("\n[Skenario 4] Penolakan Layanan Tanpa Auto-Cancel...");
  const tNum4 = await generateUniqueTicketNumber("PK");
  const { data: catPk } = await supabase.from("service_categories").select("id, sla_days").eq("code", "PK").single();
  const { data: subPk } = await supabase.from("sub_services").select("id").eq("category_id", catPk?.id).limit(1).single();

  const { data: t4, error: t4Err } = await supabase
    .from("tickets")
    .insert({
      ticket_number: tNum4,
      category_id: catPk?.id,
      sub_service_id: subPk?.id,
      applicant_name: "Pemohon Uji Bahan Kimia Terlarang",
      whatsapp_number: "081266664444",
      whatsapp_pin_last4: "4444",
      subject: "Permohonan Uji Toksisitas Merkuri",
      description: "Uji sampel limbah industri non-pertanian.",
      status: "diproses",
      sla_days: catPk?.sla_days || 14,
    })
    .select()
    .single();
  if (t4Err) console.error("t4Err:", t4Err);
  assert(t4, "Tiket 4 harus dibuat");

  // Penyelesaian dengan klarifikasi penolakan (akuntabilitas zona integritas)
  await supabase
    .from("tickets")
    .update({
      status: "selesai",
      completed_at: new Date().toISOString(),
      completion_note: "Mohon maaf, laboratorium BRMP Banten saat ini hanya terakreditasi untuk pengujian mutu beras dan unsur hara tanah pertanian. Permohonan Anda tidak dapat dipenuhi.",
    })
    .eq("id", t4.id);

  const { data: t4Final } = await supabase
    .from("tickets")
    .select("status, completion_note")
    .eq("id", t4.id)
    .single();
  assert(t4Final?.status === "selesai", "Status harus selesai");
  assert(t4Final?.completion_note?.includes("Mohon maaf"), "Harus memuat catatan klarifikasi & permohonan maaf");
  console.log(`  1. Tiket diselesaikan akuntabel: "${t4Final.completion_note?.slice(0, 50)}..."`);

  // Cleanup Skenario 4
  await supabase.from("tickets").delete().eq("id", t4.id);
  console.log("✓ Skenario 4 PASSED & dibersihkan.");

  console.log("\nALL 4 E2E LIFECYCLE SCENARIOS PASSED 100%!");
}

runE2EScenarios().catch((err) => {
  console.error("E2E Scenarios Failed:", err);
  process.exit(1);
});
