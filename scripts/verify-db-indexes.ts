import { Client } from "pg";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const REQUIRED_INDEXES = [
  { name: "idx_tickets_ticket_number", table: "tickets", sql: "CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);" },
  { name: "idx_tickets_status", table: "tickets", sql: "CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);" },
  { name: "idx_tickets_team_id", table: "tickets", sql: "CREATE INDEX IF NOT EXISTS idx_tickets_team_id ON tickets(team_id);" },
  { name: "idx_tickets_category_id", table: "tickets", sql: "CREATE INDEX IF NOT EXISTS idx_tickets_category_id ON tickets(category_id);" },
  { name: "idx_tickets_whatsapp_pin", table: "tickets", sql: "CREATE INDEX IF NOT EXISTS idx_tickets_whatsapp_pin ON tickets(whatsapp_number, whatsapp_pin_last4);" },
  { name: "idx_tickets_active", table: "tickets", sql: "CREATE INDEX IF NOT EXISTS idx_tickets_active ON tickets(status) WHERE deleted_at IS NULL;" },
  { name: "idx_variety_batches_fefo", table: "variety_batches", sql: "CREATE INDEX IF NOT EXISTS idx_variety_batches_fefo ON variety_batches(variety_id, expiry_date ASC);" },
  { name: "idx_variety_batches_active", table: "variety_batches", sql: "CREATE INDEX IF NOT EXISTS idx_variety_batches_active ON variety_batches(variety_id, expiry_date ASC) WHERE deleted_at IS NULL;" },
  { name: "idx_varieties_active", table: "varieties", sql: "CREATE INDEX IF NOT EXISTS idx_varieties_active ON varieties(commodity_type) WHERE deleted_at IS NULL;" },
  { name: "idx_audit_logs_ticket_id", table: "ticket_audit_logs", sql: "CREATE INDEX IF NOT EXISTS idx_audit_logs_ticket_id ON ticket_audit_logs(ticket_id, created_at DESC);" },
  { name: "idx_surveys_ticket_id", table: "surveys", sql: "CREATE INDEX IF NOT EXISTS idx_surveys_ticket_id ON surveys(ticket_id);" },
  { name: "idx_holidays_date", table: "holidays", sql: "CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);" },
  { name: "idx_users_email_active", table: "users", sql: "CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email) WHERE deleted_at IS NULL;" },
  { name: "idx_user_sessions_token", table: "user_sessions", sql: "CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token_hash);" },
];

async function verifyIndexes() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL tidak terdefinisi di .env");
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("=== AUDIT INDEKS DATABASE SUPABASE POSTGRESQL ===");

    // Fetch existing indexes in public schema
    const res = await client.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public';
    `);

    const existingIndexNames = new Set(res.rows.map((r) => r.indexname));

    let createdCount = 0;
    for (const req of REQUIRED_INDEXES) {
      if (existingIndexNames.has(req.name)) {
        console.log(`  ✓ Indeks ditemukan: ${req.name} pada tabel ${req.table}`);
      } else {
        console.log(`  + Memasang indeks: ${req.name} pada tabel ${req.table}...`);
        await client.query(req.sql);
        createdCount++;
        console.log(`    ✓ Berhasil dipasang.`);
      }
    }

    console.log(`\nVerifikasi selesai: ${REQUIRED_INDEXES.length} indeks kritis terverifikasi (${createdCount} baru dipasang).`);
  } catch (err) {
    console.error("Gagal memeriksa indeks database:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyIndexes();
