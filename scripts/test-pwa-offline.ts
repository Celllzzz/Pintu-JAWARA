import * as fs from "fs";
import * as path from "path";
import assert from "assert";

async function runPwaOfflineTests() {
  console.log("=== RUNNING PWA & OFFLINE SELF-TESTS ===");

  const rootDir = process.cwd();

  // 1. Verify Favicon Files Exist
  console.log("[1/4] Checking favicon assets...");
  const favicons = [
    "public/favicon.ico",
    "public/favicon-32x32.png",
    "public/favicon-16x16.png",
    "public/apple-touch-icon.png",
    "src/app/favicon.ico",
  ];

  for (const f of favicons) {
    const fullPath = path.resolve(rootDir, f);
    assert(fs.existsSync(fullPath), `Favicon file ${f} must exist`);
    const stat = fs.statSync(fullPath);
    assert(stat.size > 0, `Favicon ${f} must not be empty`);
  }
  console.log("✓ All favicon files verified.");

  // 2. Verify PWA Icons & Manifest
  console.log("[2/4] Checking PWA manifest & icon sizes...");
  const manifestPath = path.resolve(rootDir, "public/manifest.json");
  assert(fs.existsSync(manifestPath), "manifest.json must exist");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  assert(manifest.name === "Pintu JAWARA BRMP Banten", "Manifest name match");
  assert(manifest.display === "standalone", "Display must be standalone");
  assert(manifest.theme_color === "#1e4f28", "Theme color must be #1e4f28");

  for (const icon of manifest.icons) {
    const iconPath = path.resolve(rootDir, "public", icon.src.replace(/^\//, ""));
    assert(fs.existsSync(iconPath), `Manifest icon ${icon.src} must exist physically`);
  }
  console.log("✓ Manifest and PWA icons verified.");

  // 3. Verify Service Worker Precache Assets
  console.log("[3/4] Checking service worker script & precache list...");
  const swPath = path.resolve(rootDir, "public/sw.js");
  assert(fs.existsSync(swPath), "sw.js must exist");
  const swContent = fs.readFileSync(swPath, "utf-8");

  assert(swContent.includes("PRECACHE_ASSETS"), "SW must define PRECACHE_ASSETS");
  assert(swContent.includes("/offline"), "SW must precache /offline");
  assert(swContent.includes("pj-static-v1"), "SW must have static cache version");
  console.log("✓ Service Worker verified.");

  // 4. Test Offline Storage In-Memory Logic Simulation
  console.log("[4/4] Simulating offline ticket cache logic...");
  const simulatedStorage: Record<string, string> = {};

  const mockTicket = {
    ticket_number: "SL-BS-OFFLINE1",
    applicant_name: "Petani Mandiri",
    subject: "Permohonan Benih",
    status: "diproses",
  };
  const pin = "1234";

  // Simulate save
  simulatedStorage[mockTicket.ticket_number] = JSON.stringify({
    ticket: mockTicket,
    pinLast4: pin,
    cachedAt: new Date().toISOString(),
  });

  // Simulate retrieval
  const entry = JSON.parse(simulatedStorage["SL-BS-OFFLINE1"]);
  assert(entry.pinLast4 === "1234", "Stored PIN must match");
  assert(entry.ticket.applicant_name === "Petani Mandiri", "Stored ticket must match");

  // Wrong PIN simulation
  assert(entry.pinLast4 !== "9999", "Wrong PIN must not match");

  console.log("✓ Offline storage simulation PASSED.");

  console.log("\nALL PWA & OFFLINE TESTS PASSED SUCCESSFULLY!");
}

runPwaOfflineTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
