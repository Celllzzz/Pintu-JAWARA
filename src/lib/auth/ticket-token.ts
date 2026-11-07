import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET || "fallback-secret-min-32-chars-long";

export function signTicketToken(ticketId: string, ttlSeconds = 7200): string {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${ticketId}.${expiresAt}`;
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(payload);
  const signature = hmac.digest("hex");
  return `${payload}.${signature}`;
}

export function verifyTicketToken(token: string): { valid: boolean; ticketId?: string } {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false };
  }

  const [ticketId, expiresAtStr, signature] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Math.floor(Date.now() / 1000) > expiresAt) {
    return { valid: false };
  }

  const payload = `${ticketId}.${expiresAtStr}`;
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return { valid: false };
  }

  return { valid: true, ticketId };
}
