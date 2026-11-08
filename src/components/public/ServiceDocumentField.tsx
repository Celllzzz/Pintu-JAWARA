import React from "react";
import { FileText, AlertCircle } from "lucide-react";

interface ServiceDocumentFieldProps {
  file: File | null;
  fileError: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ServiceDocumentField({
  file,
  fileError,
  onFileChange,
}: ServiceDocumentFieldProps) {
  return (
    <div className="rounded-xl border border-[#d1ded0] bg-white p-5 sm:p-6 shadow-none space-y-4">
      <div className="border-b border-[#e2e8f0] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
          LANGKAH 3 DARI 3
        </span>
        <h3 className="text-base font-bold text-[#191c19]">Berkas Persyaratan Administrasi</h3>
      </div>

      <div>
        <label
          htmlFor="req_file"
          className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1"
        >
          Unggah Dokumen Pendukung (Opsional)
        </label>
        <p className="text-[11px] text-[#475447] mb-2">
          Format yang diizinkan: <strong>PDF (.pdf)</strong> atau <strong>Word (.doc, .docx)</strong>. Ukuran maksimal <strong>1 MB</strong>.
        </p>

        <input
          id="req_file"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={onFileChange}
          className="block w-full text-xs text-[#475447] file:mr-3 file:h-11 file:min-h-[44px] file:rounded-lg file:border-0 file:bg-[#1e4f28] file:px-4 file:text-xs file:font-semibold file:text-white file:hover:bg-[#163c1e] cursor-pointer"
        />

        {file && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#1e4f28]">
            <FileText className="h-4 w-4" />
            <span>
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </p>
        )}

        {fileError && (
          <div className="mt-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-2.5 text-xs text-[#991b1b] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
