export type WhatsAppEvent =
  | "pengajuan_baru"
  | "perlu_perbaikan"
  | "disposisi"
  | "diproses"
  | "tagihan_baru"
  | "bukti_bayar_ditolak"
  | "layanan_selesai";

export interface WhatsAppNotificationData {
  ticketNumber: string;
  applicantName: string;
  whatsappNumber: string;
  serviceName?: string;
  teamName?: string;
  notes?: string;
  amount?: number;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  pinLast4?: string;
  trackUrl?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

export interface WhatsAppAdapter {
  readonly name: string;
  send(phone: string, text: string): Promise<WhatsAppSendResult>;
}
