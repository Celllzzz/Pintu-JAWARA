"use client";

import React, { useState } from "react";
import { FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface RevisionUploadProps {
  ticketId: string;
  notesFromOfficer?: string | null;
  onSuccess: () => void;
}

export function RevisionUpload({
  ticketId,
  notesFromOfficer,
  onSuccess,
}: RevisionUploadProps) {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [applicantNotes, setApplicantNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      showToast("Pilih berkas perbaikan terlebih dahulu.", "warning");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("document_type", "perbaikan_berkas");
      formData.append("file", file);
      formData.append("notes", applicantNotes);

      const res = await fetch(`/api/tickets/${ticketId}/documents`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal mengunggah berkas perbaikan.", "error");
        return;
      }

      showToast("Berkas perbaikan berhasil dikirim.", "success");
      setFile(null);
      setApplicantNotes("");
      onSuccess();
    } catch {
      showToast("Gangguan koneksi saat mengunggah berkas.", "error");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-5 sm:p-6 shadow-none">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-[#fef3c7] p-2 text-[#92400e]">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#92400e]">
            TINDAK LANJUT PEMOHON
          </span>
          <h3 className="text-base font-bold text-[#191c19]">
            Unggah Berkas Perbaikan / Revisi
          </h3>
          <p className="mt-1 text-xs text-[#475447] leading-relaxed">
            Petugas meminta perbaikan dokumen atau sampel persyaratan administrasi.
            Argo waktu SLA dijeda hingga berkas perbaikan ini diunggah.
          </p>

          {notesFromOfficer && (
            <div className="mt-3 rounded-lg border border-[#fde68a] bg-white p-3 text-xs text-[#191c19]">
              <span className="font-bold text-[#92400e] block mb-1">
                Catatan dari Petugas:
              </span>
              <p className="whitespace-pre-line text-[#475447] leading-relaxed">
                {notesFromOfficer}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label
                htmlFor="rev_file"
                className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1"
              >
                Pilih Berkas Perbaikan (PDF, JPG, PNG maks. 10 MB)
              </label>
              <input
                id="rev_file"
                type="file"
                required
                accept=".pdf,image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-[#475447] file:mr-3 file:h-10 file:min-h-[40px] file:rounded-lg file:border-0 file:bg-[#1e4f28] file:px-4 file:text-xs file:font-semibold file:text-white file:hover:bg-[#163c1e] cursor-pointer"
              />
              {file && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#1e4f28]">
                  <FileText className="h-3.5 w-3.5" />
                  <span>
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="rev_notes"
                className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1"
              >
                Keterangan Tambahan Pemohon (Opsional)
              </label>
              <textarea
                id="rev_notes"
                rows={2}
                value={applicantNotes}
                onChange={(e) => setApplicantNotes(e.target.value)}
                placeholder="Contoh: Lampiran KTP terbaru dan surat permohonan revisi."
                className="block w-full rounded-lg border border-[#d1ded0] bg-white p-2.5 text-xs text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading || !file}
              className="flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-[#1e4f28] px-5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-50 transition-colors"
            >
              <span>{isUploading ? "Mengunggah..." : "Kirim Berkas Perbaikan"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
