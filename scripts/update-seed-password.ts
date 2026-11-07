import { Client } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function updatePassword() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const hash = await bcrypt.hash("Admin123", 10);
    const res = await client.query(
      "UPDATE users SET password_hash = $1 WHERE email = 'admin@brmpbanten.pertanian.go.id' RETURNING email, role;",
      [hash]
    );
    console.log("Password admin terupdate:", res.rows);
  } finally {
    await client.end();
  }
}

updatePassword();
