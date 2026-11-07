import { NextResponse } from "next/server";
import { getActiveVarieties } from "@/lib/services/catalog";

export async function GET() {
  try {
    const varieties = await getActiveVarieties();
    return NextResponse.json({ varieties });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memuat katalog";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
