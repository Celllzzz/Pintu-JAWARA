import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Generates a globally unique e-ticket number with format: SL-[KODE]-[6_DIGIT]
 * Example: SL-BS-948231, SL-IP-382910
 */
export async function generateUniqueTicketNumber(
  categoryCode: string
): Promise<string> {
  const supabase = createAdminClient();
  const prefix = `SL-${categoryCode.trim().toUpperCase()}`;

  for (let attempt = 0; attempt < 5; attempt++) {
    // Generate 6 random digits (100000 - 999999)
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    const candidate = `${prefix}-${randomDigits}`;

    const { data: existing } = await supabase
      .from("tickets")
      .select("id")
      .eq("ticket_number", candidate)
      .maybeSingle();

    if (!existing) {
      return candidate;
    }
  }

  // Fallback with timestamp slice if collision persists
  const timestampSuffix = Date.now().toString().slice(-6);
  return `${prefix}-${timestampSuffix}`;
}
