import React from "react";
import Image from "next/image";
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

      {/* Official Letterhead Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center gap-4">
          <Image
            src="/logo/Kementerian Pertanian Kementan Logo - Colored - zonalogo.com.svg"
            alt="Logo BRMP Banten"
            width={56}
            height={56}
            className="h-14 w-auto object-contain shrink-0"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-black leading-tight">
              PINTU JAWARA — BRMP BANTEN
            </h1>
            <p className="text-xs font-semibold text-[#1e4f28]">
              Pusat Informasi Terpadu Satu Pintu
            </p>
            <p className="text-[11px] text-[#475447] mt-0.5">
              Jl. Ciptayasa KM 01, Ciruas, Kabupaten Serang, Provinsi Banten 42182 · Telp: (0254) 281055
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
          <div>
            <span className="font-bold uppercase tracking-wider text-[11px] text-black">
              LAPORAN KINERJA PELAYANAN PUBLIK (TABEL 8 KOLOM BAKU)
            </span>
            <p className="text-[11px] text-[#475447]">
              Filter: {range === "all" ? "Semua Waktu" : range.toUpperCase()} | Kategori: {categoryCode.toUpperCase()}
            </p>
          </div>
          <div className="text-left sm:text-right text-[11px]">
            <span className="font-semibold text-black block">Waktu Cetak / Ekspor Resmi:</span>
            <span className="font-mono tabular-nums text-[#475447]">{exportTimestamp}</span>
          </div>
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

      {/* Official Signature Area */}
      <div className="mt-12 flex justify-between items-start text-xs print:break-inside-avoid">
        <div className="text-[11px] text-[#475447]">
          <p>Dokumen ini dicetak otomatis dari sistem Pintu JAWARA.</p>
          <p>Akuntabilitas data terintegrasi Zona Integritas BRMP Banten.</p>
        </div>

        <div className="text-center w-64 space-y-16">
          <div>
            <p>Ciruas, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            <p className="font-semibold">Kepala / Pimpinan BRMP Banten</p>
          </div>
          <div className="border-t border-black pt-1">
            <p className="font-bold text-black">( .................................................... )</p>
            <p className="text-[10px] text-[#475447]">NIP. ........................................</p>
          </div>
        </div>
      </div>
    </div>
  );
}
