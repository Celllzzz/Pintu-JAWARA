import * as dotenv from "dotenv";
import * as path from "path";
import assert from "assert";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { checkRateLimit, resetRateLimit } from "../src/lib/auth/rate-limit";
import { signTicketToken, verifyTicketToken } from "../src/lib/auth/ticket-token";
import { createAdminClient } from "../src/lib/supabase/admin";
import { hashToken } from "../src/lib/auth/session";

async function runTests() {
  console.log("=== RUNNING AUTH & SECURITY SELF-TESTS ===");

  // 1. Password Hashing Test
  console.log("[1/5] Testing password hash & verify...");
  const plain = "Admin123";
  const hashed = await hashPassword(plain);
  assert(await verifyPassword(plain, hashed), "Password must match hash");
  assert(!(await verifyPassword("WrongPassword", hashed)), "Wrong password must fail");
  console.log("✓ Password hashing & verification PASSED.");

  // 2. Seed Admin User Credentials
  console.log("[2/5] Testing seed admin credentials in database...");
  const supabase = createAdminClient();
  const { data: adminUser, error: adminErr } = await supabase
    .from("users")
    .select("id, email, password_hash, role, is_active")
    .eq("email", "admin@brmpbanten.pertanian.go.id")
    .single();

  assert(!adminErr && adminUser, "Seed admin must exist in DB");
  assert(adminUser.role === "admin_l1", "Seed admin role must be admin_l1");
  assert(adminUser.is_active === true, "Seed admin must be active");
  assert(await verifyPassword("Admin123", adminUser.password_hash), "Seed admin password must match Admin123");
  console.log("✓ Seed admin credentials PASSED.");

  // 3. Rate Limiter Test (Sliding Window)
  console.log("[3/5] Testing rate limiter sliding window...");
  const testKey = "test-rate-limit-key";
  resetRateLimit(testKey);

  for (let i = 1; i <= 5; i++) {
    const res = checkRateLimit(testKey, 5, 60000);
    assert(res.allowed === true, `Attempt ${i} should be allowed`);
    assert(res.remaining === 5 - i, `Remaining attempts should be ${5 - i}`);
  }

  const blockedRes = checkRateLimit(testKey, 5, 60000);
  assert(blockedRes.allowed === false, "6th attempt must be blocked");
  assert(blockedRes.retryAfterSeconds > 0, "retryAfterSeconds must be > 0");
  resetRateLimit(testKey);
  console.log("✓ Rate limiting (5 attempts limit) PASSED.");

  // 4. Ticket Access Token (HMAC SHA-256)
  console.log("[4/5] Testing HMAC ticket access token...");
  const dummyTicketId = "11111111-2222-3333-4444-555555555555";
  const validToken = signTicketToken(dummyTicketId, 3600);
  const verifyResult = verifyTicketToken(validToken);
  assert(verifyResult.valid === true, "Token must be valid");
  assert(verifyResult.ticketId === dummyTicketId, "Ticket ID must match");

  const tamperedToken = validToken.substring(0, validToken.length - 2) + "xx";
  const tamperedResult = verifyTicketToken(tamperedToken);
  assert(tamperedResult.valid === false, "Tampered token must fail");

  const expiredToken = signTicketToken(dummyTicketId, -10);
  const expiredResult = verifyTicketToken(expiredToken);
  assert(expiredResult.valid === false, "Expired token must fail");
  console.log("✓ Ticket access token signing & verification PASSED.");

  // 5. User Lifecycle & Session Flow
  console.log("[5/5] Testing user session lifecycle in Supabase...");
  const rawToken = "test_raw_token_" + Date.now();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

  const { error: sessionInsertErr } = await supabase.from("user_sessions").insert({
    user_id: adminUser.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
    ip_address: "127.0.0.1",
  });
  assert(!sessionInsertErr, "Session insert must succeed");

  const { data: sessionData, error: sessionFetchErr } = await supabase
    .from("user_sessions")
    .select("id, user_id")
    .eq("token_hash", tokenHash)
    .single();
  assert(!sessionFetchErr && sessionData, "Session must exist");

  await supabase.from("user_sessions").delete().eq("token_hash", tokenHash);
  const { data: deletedCheck } = await supabase
    .from("user_sessions")
    .select("id")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  assert(!deletedCheck, "Session must be deleted");
  console.log("✓ Session lifecycle PASSED.");

  console.log("\nALL AUTH & SECURITY TESTS PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
