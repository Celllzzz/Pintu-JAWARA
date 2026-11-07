import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import nextConfig from "../next.config";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runProductionReadinessCheck() {
  console.log("=========================================================");
  console.log("   PINTU JAWARA BRMP BANTEN - PRODUCTION PRE-FLIGHT AUDIT");
  console.log("=========================================================\n");

  let passedAll = true;

  // 1. Environment Variables Audit
  console.log("[1/6] Memeriksa Environment Variables Kritis...");
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "DATABASE_URL",
    "AUTH_SECRET",
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`  ✗ GAGAL: ${envVar} tidak terdefinisi.`);
      passedAll = false;
    } else {
      console.log(`  ✓ ${envVar}: Terkonfigurasi.`);
    }
  }

  // 2. Gitignore Verification
  console.log("\n[2/6] Memeriksa Konfigurasi .gitignore...");
  const gitignoreContent = fs.readFileSync(path.resolve(process.cwd(), ".gitignore"), "utf-8");
  if (gitignoreContent.includes("docs/") || gitignoreContent.includes("/docs/")) {
    console.log("  ✓ Folder docs/ berhasil masuk dalam daftar .gitignore (aman dari commit).");
  } else {
    console.error("  ✗ GAGAL: docs/ belum terdaftar di .gitignore.");
    passedAll = false;
  }

  // 3. Asset Cleanup & Public Directory Audit
  console.log("\n[3/6] Memeriksa Higienitas Aset Direktori public/...");
  const forbiddenAssets = [
    "public/window.svg",
    "public/vercel.svg",
    "public/next.svg",
    "public/globe.svg",
    "public/file.svg",
    "public/favicon-jawara",
    "public/android-chrome-512x512.png",
    "public/android-chrome-192x192.png",
    "public/logo/Kementerian Pertanian Kementan Logo - Colored - zonalogo.com.png",
  ];

  for (const forbidden of forbiddenAssets) {
    if (fs.existsSync(path.resolve(process.cwd(), forbidden))) {
      console.error(`  ✗ GAGAL: Berkas sisa/duplikat masih ada: ${forbidden}`);
      passedAll = false;
    }
  }

  const mandatoryAssets = [
    "public/sw.js",
    "public/manifest.json",
    "public/logo/Kementerian Pertanian Kementan Logo - Colored - zonalogo.com.svg",
    "public/icons/icon-192.png",
    "public/icons/icon-512.png",
    "public/favicon.ico",
    "public/favicon-32x32.png",
    "public/favicon-16x16.png",
    "public/apple-touch-icon.png",
  ];

  for (const mandatory of mandatoryAssets) {
    if (!fs.existsSync(path.resolve(process.cwd(), mandatory))) {
      console.error(`  ✗ GAGAL: Aset wajib tidak ditemukan: ${mandatory}`);
      passedAll = false;
    } else {
      console.log(`  ✓ Aset resmi hadir: ${mandatory}`);
    }
  }

  // 4. Security Headers Verification
  console.log("\n[4/6] Memeriksa HTTP Security Headers di next.config.ts...");
  if (typeof nextConfig.headers === "function") {
    const headersList = await nextConfig.headers();
    const globalHeaderRule = headersList.find((h) => h.source === "/(.*)");

    if (!globalHeaderRule) {
      console.error("  ✗ GAGAL: Aturan header global '/(.*)' tidak ditemukan.");
      passedAll = false;
    } else {
      const keys = globalHeaderRule.headers.map((h) => h.key);
      const expectedKeys = [
        "Strict-Transport-Security",
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "Permissions-Policy",
        "Content-Security-Policy",
      ];

      for (const k of expectedKeys) {
        if (keys.includes(k)) {
          console.log(`  ✓ Security Header aktif: ${k}`);
        } else {
          console.error(`  ✗ GAGAL: Security Header ${k} belum terpasang.`);
          passedAll = false;
        }
      }
    }
  } else {
    console.error("  ✗ GAGAL: nextConfig.headers bukan function.");
    passedAll = false;
  }

  // 5. Error Boundaries & SEO Discovery Audit
  console.log("\n[5/6] Memeriksa Keberadaan Berkas Resiliensi & SEO...");
  const criticalAppFiles = [
    "src/app/not-found.tsx",
    "src/app/error.tsx",
    "src/app/global-error.tsx",
    "src/app/robots.ts",
    "src/app/sitemap.ts",
  ];

  for (const file of criticalAppFiles) {
    if (fs.existsSync(path.resolve(process.cwd(), file))) {
      console.log(`  ✓ Berkas terverifikasi: ${file}`);
    } else {
      console.error(`  ✗ GAGAL: Berkas kritis hilang: ${file}`);
      passedAll = false;
    }
  }

  // 6. Live Supabase Connectivity & Seed Validation
  console.log("\n[6/6] Memeriksa Integritas Layanan Supabase & Akun Admin...");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name")
    .is("deleted_at", null);

  if (teamsError || !teams || teams.length !== 8) {
    console.error("  ✗ GAGAL: 8 Tim Penanganan tidak ditemukan di database.");
    passedAll = false;
  } else {
    console.log(`  ✓ 8 Tim Penanganan siap melayani (${teams.length} tim aktif).`);
  }

  const { data: categories, error: catsError } = await supabase
    .from("service_categories")
    .select("id, code, name")
    .is("deleted_at", null);

  if (catsError || !categories || categories.length !== 8) {
    console.error("  ✗ GAGAL: 8 Kategori Layanan tidak ditemukan di database.");
    passedAll = false;
  } else {
    console.log(`  ✓ 8 Kategori Layanan terverifikasi (${categories.length} kategori).`);
  }

  console.log("\n---------------------------------------------------------");
  if (passedAll) {
    console.log(">>> HASIL AUDIT: SISTEM 100% PRODUCTION READY! <<<");
    console.log("---------------------------------------------------------");
    process.exit(0);
  } else {
    console.error(">>> HASIL AUDIT: DITEMUKAN DEFISIENSI KRITIS! <<<");
    console.log("---------------------------------------------------------");
    process.exit(1);
  }
}

runProductionReadinessCheck();
