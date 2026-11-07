import { WhatsAppEvent, WhatsAppNotificationData } from "./types";

function formatRupiah(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
}

export function buildWhatsAppMessage(
  event: WhatsAppEvent,
  data: WhatsAppNotificationData,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
): string {
  const pin = data.pinLast4 || data.whatsappNumber.replace(/\D/g, "").slice(-4);
  const trackLink = data.trackUrl || (baseUrl ? `${baseUrl}/lacak?ticket=${data.ticketNumber}&pin=${pin}` : `/lacak?ticket=${data.ticketNumber}&pin=${pin}`);

  const header = `*PINTU JAWARA — BRMP BANTEN*\n_Pusat Informasi Terpadu_\n----------------------------------------`;
  const footer = `----------------------------------------\nLayanan resmi BRMP Banten.\nInformasi & bantuan: 0851-1121-6203`;

  switch (event) {
    case "pengajuan_baru":
      return `${header}
Yth. Bapak/Ibu *${data.applicantName}*,

Permohonan layanan publik Anda telah berhasil didaftarkan di sistem Pintu JAWARA.

*Rincian Permohonan:*
• Nomor E-Tiket: *${data.ticketNumber}*
• Layanan: ${data.serviceName || "Layanan BRMP Banten"}
• PIN Pelacakan: *${pin}* (4 digit terakhir nomor telepon Anda)

Pantau progres permohonan Anda melalui tautan berikut:
${trackLink}

Harap simpan nomor e-tiket ini untuk pelacakan layanan.
${footer}`;

    case "perlu_perbaikan":
      return `${header}
Yth. Bapak/Ibu *${data.applicantName}*,

Permohonan Anda dengan nomor e-tiket *${data.ticketNumber}* memerlukan *perbaikan berkas / sampel persyaratan*.

*Catatan Petugas:*
_${data.notes || "Berkas persyaratan belum lengkap atau perlu diperbarui."}_

*Perhatian:* Perhitungan waktu penyelesaian (SLA) dijeda hingga berkas perbaikan diunggah.

Silakan unggah dokumen perbaikan melalui tautan berikut:
${trackLink}
${footer}`;

    case "disposisi":
      return `${header}
Yth. Bapak/Ibu *${data.applicantName}*,

Permohonan Anda dengan nomor e-tiket *${data.ticketNumber}* telah *diverifikasi lengkap* dan *didisposisikan* ke:
*${data.teamName || "Tim Penanganan Teknis"}*

Petugas unit penanganan akan segera menindaklanjuti permohonan Anda.

Pantau progres melalui tautan:
${trackLink}
${footer}`;

    case "diproses":
      return `${header}
Yth. Bapak/Ibu *${data.applicantName}*,

Permohonan Anda dengan nomor e-tiket *${data.ticketNumber}* saat ini *sedang diproses* oleh unit pelaksana.

${data.notes ? `*Catatan:* ${data.notes}\n` : ""}Argo standar waktu penyelesaian (SLA hari kerja) telah aktif berjalan.

Pantau progres layanan Anda:
${trackLink}
${footer}`;

    case "tagihan_baru":
      return `${header}
Yth. Bapak/Ibu *${data.applicantName}*,

Tagihan biaya resmi untuk permohonan e-tiket *${data.ticketNumber}* telah diterbitkan.

*Rincian Tagihan:*
• Total Biaya: *${formatRupiah(data.amount || 0)}*
• Bank Tujuan: *${data.bankName || "Bank Mandiri"}*
• Nomor Rekening: *${data.accountNumber || "—"}*
• Atas Nama: *${data.accountHolder || "BPPTP Banten (BRMP)"}*
${data.notes ? `• Keterangan: ${data.notes}\n` : ""}
Setelah melakukan pembayaran, mohon unggah bukti transfer melalui tautan berikut agar dapat diverifikasi petugas:
${trackLink}
${footer}`;

    case "bukti_bayar_ditolak":
      return `${header}
Yth. Bapak/Ibu *${data.applicantName}*,

Bukti pembayaran yang Anda unggah untuk e-tiket *${data.ticketNumber}* *belum dapat diverifikasi*.

*Alasan:*
_${data.notes || "Bukti transfer tidak terbaca atau nominal tidak sesuai."}_

Mohon unggah kembali bukti transfer yang valid melalui tautan:
${trackLink}
${footer}`;

    case "layanan_selesai":
      return `${header}
Yth. Bapak/Ibu *${data.applicantName}*,

Permohonan layanan publik Anda dengan nomor e-tiket *${data.ticketNumber}* telah *SELESAI*.

${data.notes ? `*Keterangan Petugas:* ${data.notes}\n` : ""}
Sesuai standar Zona Integritas, mohon luangkan waktu 2 menit untuk mengisi *Survei Kepuasan Masyarakat (SKM)* agar akses unduh dokumen hasil layanan terbuka:
${trackLink}

Terima kasih telah memanfaatkan layanan publik BRMP Banten.
${footer}`;

    default:
      return `${header}
Yth. Bapak/Ibu *${data.applicantName}*,
Terdapat pembaruan status pada tiket Anda: *${data.ticketNumber}*.
Lihat detail: ${trackLink}
${footer}`;
  }
}
