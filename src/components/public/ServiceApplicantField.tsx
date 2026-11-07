import React from "react";

interface ServiceApplicantFieldProps {
  applicantName: string;
  onChangeApplicantName: (val: string) => void;
  whatsappNumber: string;
  onChangeWhatsappNumber: (val: string) => void;
  subject: string;
  onChangeSubject: (val: string) => void;
  description: string;
  onChangeDescription: (val: string) => void;
}

export function ServiceApplicantField({
  applicantName,
  onChangeApplicantName,
  whatsappNumber,
  onChangeWhatsappNumber,
  subject,
  onChangeSubject,
  description,
  onChangeDescription,
}: ServiceApplicantFieldProps) {
  return (
    <div className="rounded-xl border border-[#d1ded0] bg-white p-5 sm:p-6 shadow-none space-y-4">
      <div className="border-b border-[#e2e8f0] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
          LANGKAH 2 DARI 3
        </span>
        <h3 className="text-base font-bold text-[#191c19]">Identitas &amp; Uraian Kebutuhan</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="applicant_name"
            className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
          >
            Nama Pemohon / Kelompok Tani
          </label>
          <input
            id="applicant_name"
            type="text"
            required
            value={applicantName}
            onChange={(e) => onChangeApplicantName(e.target.value)}
            placeholder="Nama Lengkap"
            className="block w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 text-xs sm:text-sm text-[#191c19] placeholder:text-[#475447]/60 focus:border-[#1e4f28] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="whatsapp_number"
            className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
          >
            Nomor WhatsApp Aktif
          </label>
          <input
            id="whatsapp_number"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            value={whatsappNumber}
            onChange={(e) => onChangeWhatsappNumber(e.target.value.replace(/\D/g, ""))}
            placeholder="081234567890"
            className="block w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 text-xs sm:text-sm font-mono tabular-nums text-[#191c19] placeholder:font-sans placeholder:text-[#475447]/60 focus:border-[#1e4f28] focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-[#475447]">
            *4 digit terakhir nomor ini akan menjadi kunci otentikasi pelacakan tiket.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="subject"
          className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
        >
          Perihal Permohonan
        </label>
        <input
          id="subject"
          type="text"
          required
          value={subject}
          onChange={(e) => onChangeSubject(e.target.value)}
          placeholder="Contoh: Permohonan Uji Sampel Hara Tanah Lahan Sawah"
          className="block w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 text-xs sm:text-sm text-[#191c19] placeholder:text-[#475447]/60 focus:border-[#1e4f28] focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
        >
          Uraian Lengkap Kebutuhan Layanan
        </label>
        <textarea
          id="description"
          required
          rows={3}
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder="Jelaskan secara spesifik lokasi, komoditas, jumlah sampel, atau rincian permohonan Anda..."
          className="block w-full rounded-lg border border-[#d1ded0] bg-white p-3 text-xs sm:text-sm text-[#191c19] placeholder:text-[#475447]/60 leading-relaxed focus:border-[#1e4f28] focus:outline-none"
        />
      </div>
    </div>
  );
}
