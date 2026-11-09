import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getLiveKPIMetrics,
  getOverdueTickets,
  getReport8ColumnData,
} from "@/lib/services/pimpinan";
import { PimpinanClientView } from "@/components/pimpinan/PimpinanClientView";

export default async function PimpinanDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "pimpinan") {
    redirect("/login");
  }

  const supabase = createAdminClient();

  const [metrics, overdueTickets, reportRows, categoriesRes] = await Promise.all([
    getLiveKPIMetrics(),
    getOverdueTickets(),
    getReport8ColumnData({ range: "all", categoryCode: "all", limit: 50 }),
    supabase
      .from("service_categories")
      .select("code, name")
      .is("deleted_at", null)
      .order("code", { ascending: true }),
  ]);

  const categories = categoriesRes.data || [];

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e2e8f0] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
            DASHBOARD EKSEKUTIF PIMPINAN
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#191c19] mt-0.5">
            Monitoring Kinerja Sistem Pintu JAWARA
          </h1>
          <p className="text-xs text-[#475447]">
            Pemantauan kepatuhan SLA hari kerja, volume layanan publik, dan skor IKM sistem saat ini.
          </p>
        </div>
        <div className="text-xs text-[#475447] text-right">
          <span>Pimpinan: <strong className="text-[#191c19]">{user.full_name}</strong></span>
        </div>
      </div>

      <PimpinanClientView
        initialMetrics={metrics}
        initialOverdue={overdueTickets}
        initialReportRows={reportRows}
        categories={categories}
      />
    </div>
  );
}
