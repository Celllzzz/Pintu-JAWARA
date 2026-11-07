import { WhatsAppAdapter, WhatsAppEvent, WhatsAppNotificationData, WhatsAppSendResult } from "./types";
import { buildWhatsAppMessage } from "./templates";
import { MockWhatsAppAdapter } from "./adapters/mock";
import { GenericHttpWhatsAppAdapter } from "./adapters/generic-http";

let defaultAdapter: WhatsAppAdapter | null = null;
const mockInstance = new MockWhatsAppAdapter();

export function getWhatsAppAdapter(): WhatsAppAdapter {
  if (defaultAdapter) return defaultAdapter;

  const provider = (process.env.WA_PROVIDER || "mock").toLowerCase();

  if (provider === "generic" || provider === "fonnte" || provider === "wablas") {
    defaultAdapter = new GenericHttpWhatsAppAdapter();
  } else {
    defaultAdapter = mockInstance;
  }

  return defaultAdapter;
}

export function setWhatsAppAdapter(adapter: WhatsAppAdapter): void {
  defaultAdapter = adapter;
}

export function getMockWhatsAppInstance(): MockWhatsAppAdapter {
  return mockInstance;
}

/**
 * Dispatches a WhatsApp notification asynchronously (fire-and-forget).
 * Catches all errors internally so caller operations (ticket creation/status changes) never fail.
 */
export async function sendWhatsAppNotification(
  event: WhatsAppEvent,
  data: WhatsAppNotificationData
): Promise<WhatsAppSendResult> {
  const adapter = getWhatsAppAdapter();
  const text = buildWhatsAppMessage(event, data);

  try {
    return await adapter.send(data.whatsappNumber, text);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      provider: adapter.name,
      error: msg,
    };
  }
}

export * from "./types";
export * from "./templates";
