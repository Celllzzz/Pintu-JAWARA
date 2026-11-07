"use client";

import React, { useState, useCallback } from "react";
import { KPIMetricsResult, OverdueTicketItem, Report8ColumnItem } from "@/lib/services/pimpinan";
import { KPISummaryCards } from "./KPISummaryCards";
import { OverdueTicketTable } from "./OverdueTicketTable";
import { ExportActionBar, CategoryOption } from "./ExportActionBar";
import { DataTable } from "@/components/ui/DataTable";

interface PimpinanClientViewProps {
  initialMetrics: KPIMetricsResult;
  initialOverdue: OverdueTicketItem[];
  initialReportRows: Report8ColumnItem[];
  categories: CategoryOption[];
}

export function PimpinanClientView({
  initialMetrics,
  initialOverdue,
  initialReportRows,
  categories,
}: PimpinanClientViewProps) {
  const [metrics] = useState<KPIMetricsResult>(initialMetrics);
  const [overdueTickets] = useState<OverdueTicketItem[]>(initialOverdue);
  const [reportRows, setReportRows] = useState<Report8ColumnItem[]>(initialReportRows);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const fetchFilteredReport = useCallback(
    async (range: string, categoryCode: string) => {
      setIsLoadingReport(true);
      try {
        const params = new URLSearchParams({
          range,
          kategori: categoryCode,
          format: "json",
        });
        const res = await fetch(`/api/pimpinan/export?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setReportRows(data.rows || []);
        }
      } catch {
        // Fallback keep existing rows
      } finally {
        setIsLoadingReport(false);
      }
    },
    []
  );

  const columns = [
    { key: "tanggal_pengajuan", header: "Tgl Pengajuan" },
    { key: "tanggal_penyelesaian", header: "Tgl Selesai" },
    {
      key: "nomor_e_tiket",
      header: "Nomor E-Tiket",
      render: (r: Report8ColumnItem) => (
        <span className="font-mono tabular-nums font-bold text-[#191c19]">
          {r.nomor_e_tiket}
        </span>
      ),
    },
    { key: "jenis_layanan", header: "Jenis Layanan" },
    { key: "nama_pemohon", header: "Nama Pemohon" },
    {
      key: "nomor_whatsapp",
      header: "No. WhatsApp",
      render: (r: Report8ColumnItem) => (
        <span className="font-mono tabular-nums text-[#475447]">
          {r.nomor_whatsapp}
        </span>
      ),
    },
    { key: "perihal", header: "Perihal" },
    { key: "tim_penanganan", header: "Tim Penanganan" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. 8 Live KPI Summary Cards */}
      <KPISummaryCards metrics={metrics} />

      {/* 2. Overdue Tickets Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#52792b]">
            PENGAWASAN TENGGAT WAKTU
          </span>
          <span className="text-xs text-[#475447]">
            Tiket Terlambat: <strong className="font-mono tabular-nums">{overdueTickets.length}</strong>
          </span>
        </div>
        <OverdueTicketTable tickets={overdueTickets} />
      </div>

      {/* 3. Export Bar & Live 8-Column Table Preview */}
      <div className="space-y-4">
        <ExportActionBar
          categories={categories}
          onFilterChange={(range, cat) => fetchFilteredReport(range, cat)}
        />

        <DataTable
          title="PRATINJAU TABEL 8 KOLOM BAKU"
          totalLabel={
            <span>
              Total Baris:{" "}
              <strong className="font-mono tabular-nums text-[#191c19]">
                {reportRows.length}
              </strong>
            </span>
          }
          data={reportRows}
          columns={columns}
          keyExtractor={(r) => r.nomor_e_tiket}
          isLoading={isLoadingReport}
          emptyMessage="Belum ada data permohonan untuk filter ini."
        />
      </div>
    </div>
  );
}
