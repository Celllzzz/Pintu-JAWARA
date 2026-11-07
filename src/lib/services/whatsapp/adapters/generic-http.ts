import { WhatsAppAdapter, WhatsAppSendResult } from "../types";

export interface GenericHttpAdapterConfig {
  apiUrl?: string;
  apiKey?: string;
  timeoutMs?: number;
}

export class GenericHttpWhatsAppAdapter implements WhatsAppAdapter {
  readonly name = "generic-http";
  private apiUrl: string;
  private apiKey: string;
  private timeoutMs: number;

  constructor(config?: GenericHttpAdapterConfig) {
    this.apiUrl = config?.apiUrl || process.env.WA_GATEWAY_API_URL || "";
    this.apiKey = config?.apiKey || process.env.WA_GATEWAY_API_KEY || "";
    this.timeoutMs = config?.timeoutMs || 5000;
  }

  async send(phone: string, text: string): Promise<WhatsAppSendResult> {
    if (!this.apiUrl || !this.apiKey) {
      return {
        success: false,
        provider: this.name,
        error: "WA_GATEWAY_API_URL atau WA_GATEWAY_API_KEY belum dikonfigurasi.",
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apiKey,
        },
        body: JSON.stringify({
          target: phone,
          message: text,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        return {
          success: false,
          provider: this.name,
          error: `HTTP ${response.status}: ${errorText.slice(0, 100)}`,
        };
      }

      const resJson = await response.json().catch(() => ({}));
      return {
        success: true,
        provider: this.name,
        messageId: resJson.id || resJson.message_id || `wa_${Date.now()}`,
      };
    } catch (err: unknown) {
      clearTimeout(timeout);
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        provider: this.name,
        error: msg,
      };
    }
  }
}
