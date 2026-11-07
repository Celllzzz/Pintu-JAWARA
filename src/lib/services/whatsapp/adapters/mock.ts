import { WhatsAppAdapter, WhatsAppSendResult } from "../types";

export interface MockLogEntry {
  phone: string;
  text: string;
  timestamp: string;
}

export class MockWhatsAppAdapter implements WhatsAppAdapter {
  readonly name = "mock";
  private logs: MockLogEntry[] = [];

  async send(phone: string, text: string): Promise<WhatsAppSendResult> {
    const cleanPhone = phone.trim();
    const entry: MockLogEntry = {
      phone: cleanPhone,
      text,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(entry);

    if (process.env.NODE_ENV !== "test") {
      console.log(`[WHATSAPP MOCK] Sent to ${cleanPhone.slice(0, 4)}****${cleanPhone.slice(-3)}:\n${text}\n`);
    }

    return {
      success: true,
      provider: "mock",
      messageId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
  }

  getSentMessages(): MockLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}
