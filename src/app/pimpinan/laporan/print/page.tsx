import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import {
  getReport8ColumnData,
  formatExportTimestamp,
} from "@/lib/services/pimpinan";
import { PrintActionButtons } from "./PrintActionButtons";

interface PrintPageProps {
  searchParams: Promise<{ range?: string; kategori?: string }>;
}

export default async function PrintReportPage({ searchParams }: PrintPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "pimpinan") {
    redirect("/login");
  }

  const params = await searchParams;
  const range = params.range || "all";
  const categoryCode = params.kategori || "all";

  const rows = await getReport8ColumnData({ range, categoryCode });
  const exportTimestamp = formatExportTimestamp();

  return (
    <div className="min-h-screen bg-white text-[#191c19] p-6 sm:p-10 font-sans print:p-0">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="print:hidden mb-6 flex items-center justify-between border-b border-[#d1ded0] pb-4">
        <div>
          <h2 className="text-sm font-bold text-[#191c19]">Pratinjau Cetak Dokumen Resmi</h2>
          <p className="text-xs text-[#475447]">
            Klik tombol Cetak / Simpan PDF di bawah untuk mencetak atau menyimpan dokumen dalam format PDF.
          </p>
        </div>
        <PrintActionButtons />
      </div>

      {/* Header Laporan Resmi (Tanpa Kop Surat) */}
      <div className="border-b-2 border-black pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
        <div>
          <h1 className="font-bold uppercase tracking-wider text-xs sm:text-sm text-black">
            LAPORAN KINERJA PELAYANAN PUBLIK (TABEL 8 KOLOM BAKU)
          </h1>
          <p className="text-[11px] text-[#475447] mt-0.5">
            Filter: {range === "all" ? "Semua Waktu" : range.toUpperCase()} | Kategori: {categoryCode.toUpperCase()}
          </p>
        </div>
        <div className="text-left sm:text-right text-[11px]">
          <span className="font-semibold text-black block">Waktu Cetak / Ekspor Resmi:</span>
          <span className="font-mono tabular-nums text-[#475447]">{exportTimestamp}</span>
        </div>
      </div>

      {/* Clean 8-Column Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse border border-black">
          <thead>
            <tr className="bg-[#f8faf4] border-b-2 border-black text-[11px] font-bold uppercase text-black">
              <th className="border border-black p-2 text-center w-8">No</th>
              <th className="border border-black p-2 text-center">Tgl Pengajuan</th>
              <th className="border border-black p-2 text-center">Tgl Selesai</th>
              <th className="border border-black p-2 text-center">Nomor E-Tiket</th>
              <th className="border border-black p-2">Jenis Layanan</th>
              <th className="border border-black p-2">Nama Pemohon / Kelompok</th>
              <th className="border border-black p-2 text-center">No. WhatsApp</th>
              <th className="border border-black p-2">Perihal</th>
              <th className="border border-black p-2">Tim Penanganan</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="border border-black p-6 text-center text-xs italic text-[#475447]">
                  Tidak ada data permohonan untuk kriteria filter ini.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={r.nomor_e_tiket} className="print:break-inside-avoid">
                  <td className="border border-black p-2 text-center font-mono tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="border border-black p-2 text-center font-mono tabular-nums whitespace-nowrap">
                    {r.tanggal_pengajuan}
                  </td>
                  <td className="border border-black p-2 text-center font-mono tabular-nums whitespace-nowrap">
                    {r.tanggal_penyelesaian}
                  </td>
                  <td className="border border-black p-2 text-center font-mono tabular-nums font-bold whitespace-nowrap">
                    {r.nomor_e_tiket}
                  </td>
                  <td className="border border-black p-2 leading-tight">
                    {r.jenis_layanan}
                  </td>
                  <td className="border border-black p-2 font-semibold leading-tight">
                    {r.nama_pemohon}
                  </td>
                  <td className="border border-black p-2 text-center font-mono tabular-nums whitespace-nowrap">
                    {r.nomor_whatsapp}
                  </td>
                  <td className="border border-black p-2 leading-tight">
                    {r.perihal}
                  </td>
                  <td className="border border-black p-2 leading-tight">
                    {r.tim_penanganan}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
