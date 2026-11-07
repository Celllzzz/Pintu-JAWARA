import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import { Database } from "../src/types/database";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function verify() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("SUPABASE URL atau SERVICE_ROLE_KEY belum diset!");
    process.exit(1);
  }

  console.log("Menguji koneksi Supabase Client REST API...");
  const supabase = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Query teams
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("code, name")
    .is("deleted_at", null);

  if (teamsError) {
    console.error("Gagal query teams:", teamsError.message);
    process.exit(1);
  }
  console.log(`✓ Teams terverifikasi via REST: ${teams?.length} tim ditemukan.`);

  // Query categories
  const { data: categories, error: catsError } = await supabase
    .from("service_categories")
    .select("code, name, sla_days")
    .is("deleted_at", null);

  if (catsError) {
    console.error("Gagal query service_categories:", catsError.message);
    process.exit(1);
  }
  console.log(`✓ Kategori layanan terverifikasi: ${categories?.length} kategori.`);

  // Query user admin L1
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("email, full_name, role")
    .is("deleted_at", null);

  if (usersError) {
    console.error("Gagal query users:", usersError.message);
    process.exit(1);
  }
  console.log(`✓ User admin terverifikasi:`, users);

  console.log("\nSemua verifikasi Supabase Client SUKSES!");
}

verify();
