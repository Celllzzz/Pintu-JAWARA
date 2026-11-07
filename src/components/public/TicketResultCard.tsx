import React from "react";
import Link from "next/link";
import { Lock, FileText } from "lucide-react";
import { TicketDetailResult } from "@/lib/services/ticket";

interface TicketResultCardProps {
  ticketData: TicketDetailResult;
}

export function TicketResultCard({ ticketData }: TicketResultCardProps) {
  if (ticketData.status !== "selesai") return null;

  const resultDocs = ticketData.documents.filter(
    (d) => d.document_type === "hasil_layanan"
  );

  return (
    <section className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-6 sm:p-8 shadow-none space-y-4">
      {/* Header and Survey CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bbf7d0] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1e4f28]">
            DOKUMEN HASIL LAYANAN
          </span>
          <h3 className="text-lg font-bold text-[#191c19]">
            Hasil Permohonan Layanan Selesai
          </h3>
          {ticketData.completed_at && (
            <p className="text-xs text-[#475447]">
              Diselesaikan pada:{" "}
              <span className="font-mono tabular-nums font-semibold">
                {new Date(ticketData.completed_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </p>
          )}
        </div>

        {ticketData.survey_filled ? (
          <span className="inline-flex items-center rounded-full bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 text-xs font-semibold text-[#065f46]">
            ✓ Survei SKM Telah Terisi
          </span>
        ) : (
          <Link
            href={`/survei/${ticketData.id}`}
            className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-[#e5a91a] px-5 text-xs sm:text-sm font-bold text-[#191c19] shadow-sm hover:bg-[#c99212] transition-colors shrink-0"
          >
            Isi Survei SKM Sekarang
          </Link>
        )}
      </div>

      {/* Officer completion note */}
      {ticketData.completion_note && (
        <div className="rounded-lg bg-white border border-[#bbf7d0] p-3 text-xs text-[#191c19]">
          <span className="font-bold text-[#1e4f28] block mb-1">
            Catatan Penyelesaian dari Petugas:
          </span>
          <p className="whitespace-pre-line text-[#475447] leading-relaxed">
            {ticketData.completion_note}
          </p>
        </div>
      )}

      {/* Document download gate */}
      <div className="pt-2">
        {!ticketData.survey_filled ? (
          <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4 text-xs text-[#92400e] flex items-start gap-3">
            <Lock className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                Akses Unduhan Dokumen Hasil Terkunci
              </p>
              <p className="text-[#475447] leading-relaxed">
                Sesuai standar pelayanan publik Zona Integritas BRMP Banten, mohon isi formulir Survei Kepuasan Masyarakat (SKM) terlebih dahulu untuk membuka akses unduh surat balasan atau sertifikat hasil pengujian.
              </p>
            </div>
          </div>
        ) : resultDocs && resultDocs.length > 0 ? (
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#191c19]">
              Berkas Hasil Siap Diunduh:
            </span>
            {resultDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-[#d1ded0] bg-white p-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#1e4f28]" />
                  <div>
                    <p className="font-bold text-[#191c19]">{doc.file_name}</p>
                    {doc.file_size_bytes && (
                      <p className="text-[11px] text-[#475447] font-mono tabular-nums">
                        {(doc.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={`/api/documents/${doc.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 min-h-[36px] items-center rounded-lg bg-[#1e4f28] px-3 font-semibold text-white hover:bg-[#163c1e] transition-colors"
                >
                  Unduh
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#475447] italic">
            Dokumen hasil fisik telah diserahkan langsung di loket pelayanan.
          </p>
        )}
      </div>
    </section>
  );
}
