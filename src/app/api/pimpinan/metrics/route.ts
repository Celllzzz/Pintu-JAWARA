import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getLiveKPIMetrics, getOverdueTickets } from "@/lib/services/pimpinan";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "pimpinan") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const [metrics, overdueTickets] = await Promise.all([
      getLiveKPIMetrics(),
      getOverdueTickets(),
    ]);

    return NextResponse.json({
      metrics,
      overdueTickets,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memuat metrik";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
