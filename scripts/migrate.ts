import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL tidak ditemukan di .env!");
    process.exit(1);
  }

  console.log("Menghubungkan ke Supabase PostgreSQL...");
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Terhubung ke database.");

    // 1. Eksekusi Schema
    console.log("\n[1/3] Menjalankan supabase/schema.sql...");
    const schemaSql = fs.readFileSync(
      path.resolve(process.cwd(), "supabase/schema.sql"),
      "utf-8"
    );
    await client.query(schemaSql);
    console.log("Schema berhasil dibuat/diperbarui.");

    // 2. Eksekusi Seed
    console.log("\n[2/3] Menjalankan supabase/seed.sql...");
    let seedSql = fs.readFileSync(
      path.resolve(process.cwd(), "supabase/seed.sql"),
      "utf-8"
    );

    // Hitung hash password pasti untuk AdminJAWARA2026!
    const passwordHash = await bcrypt.hash("AdminJAWARA2026!", 10);
    seedSql = seedSql.replace(
      "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
      passwordHash
    );

    await client.query(seedSql);
    console.log("Data seed berhasil dimasukkan.");

    // 3. Eksekusi Storage (Optional jika permission storage.buckets diizinkan)
    console.log("\n[3/3] Menjalankan supabase/storage.sql...");
    try {
      const storageSql = fs.readFileSync(
        path.resolve(process.cwd(), "supabase/storage.sql"),
        "utf-8"
      );
      await client.query(storageSql);
      console.log("Storage buckets berhasil dikonfigurasi.");
    } catch (storageErr: unknown) {
      const msg = storageErr instanceof Error ? storageErr.message : String(storageErr);
      console.warn("Storage setup via SQL dilewati (bisa dikelola via dashboard/API):", msg);
    }

    // 4. Verifikasi Jumlah Data
    console.log("\n--- VERIFIKASI DATA HASIL MIGRASI ---");
    const teamsRes = await client.query("SELECT COUNT(*) FROM teams WHERE deleted_at IS NULL;");
    const catsRes = await client.query("SELECT COUNT(*) FROM service_categories WHERE deleted_at IS NULL;");
    const subRes = await client.query("SELECT COUNT(*) FROM sub_services WHERE deleted_at IS NULL;");
    const holidaysRes = await client.query("SELECT COUNT(*) FROM holidays WHERE deleted_at IS NULL;");
    const usersRes = await client.query("SELECT email, role, full_name FROM users WHERE deleted_at IS NULL;");

    console.log(`- Jumlah Tim Penanganan: ${teamsRes.rows[0].count}`);
    console.log(`- Jumlah Kategori Layanan: ${catsRes.rows[0].count}`);
    console.log(`- Jumlah Sub-Layanan: ${subRes.rows[0].count}`);
    console.log(`- Jumlah Hari Libur 2026: ${holidaysRes.rows[0].count}`);
    console.log(`- Akun Admin L1:`, usersRes.rows);

    console.log("\nMigrasi dan Seeding Sukses!");
  } catch (err: unknown) {
    console.error("Gagal menjalankan migrasi:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
