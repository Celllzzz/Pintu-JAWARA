import React from "react";
import { FileText } from "lucide-react";

export interface TicketDocumentItem {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number | null;
  uploaded_by_role: string;
  created_at: string;
}

interface AdminTicketDocumentsProps {
  documents: TicketDocumentItem[];
}

export function AdminTicketDocuments({ documents }: AdminTicketDocumentsProps) {
  const applicantDocs = documents.filter((d) => d.uploaded_by_role === "pemohon");

  return (
    <div className="space-y-2 pt-1">
      <span className="text-xs font-bold text-[#191c19] uppercase tracking-wider text-[10px]">
        Berkas Persyaratan yang Diunggah ({applicantDocs.length}):
      </span>

      {applicantDocs.length === 0 ? (
        <p className="text-xs text-[#475447] italic">Tidak ada berkas yang dilampirkan.</p>
      ) : (
        <div className="space-y-2">
          {applicantDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-[#d1ded0] bg-[#f8faf4] p-3 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-[#1e4f28] shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-[#191c19] truncate">{doc.file_name}</p>
                  <p className="text-[11px] text-[#475447]">
                    {doc.document_type === "persyaratan_awal"
                      ? "Persyaratan Awal"
                      : "Berkas Perbaikan"}
                  </p>
                </div>
              </div>

              <a
                href={`/api/documents/${doc.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 min-h-[32px] items-center rounded-lg border border-[#d1ded0] bg-white px-3 text-xs font-semibold text-[#191c19] hover:bg-[#f8faf4] shrink-0 transition-colors"
              >
                Unduh
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
