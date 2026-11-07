import { TicketDetailResult } from "@/lib/services/ticket";

const STORAGE_KEY = "pj_offline_tickets";

export interface CachedOfflineTicket {
  ticket: TicketDetailResult;
  pinLast4: string;
  cachedAt: string;
}

function getStore(): Record<string, CachedOfflineTicket> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStore(data: Record<string, CachedOfflineTicket>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Saves or updates a tracked ticket in local device storage for offline access.
 */
export function saveOfflineTicket(
  ticket: TicketDetailResult,
  pinLast4: string
): void {
  const store = getStore();
  store[ticket.ticket_number.toUpperCase()] = {
    ticket,
    pinLast4: pinLast4.trim(),
    cachedAt: new Date().toISOString(),
  };
  setStore(store);
}

/**
 * Retrieves a cached ticket if offline, validating the 4-digit PIN.
 */
export function getOfflineTicket(
  ticketNumber: string,
  pinLast4: string
): { ticket: TicketDetailResult; cachedAt: string } | null {
  const store = getStore();
  const entry = store[ticketNumber.trim().toUpperCase()];

  if (!entry) return null;
  if (entry.pinLast4 !== pinLast4.trim()) return null;

  return { ticket: entry.ticket, cachedAt: entry.cachedAt };
}

/**
 * Lists all offline tickets stored on this device.
 */
export function listOfflineTickets(): Array<{
  ticketNumber: string;
  applicantName: string;
  subject: string;
  status: string;
  cachedAt: string;
}> {
  const store = getStore();
  return Object.values(store).map((item) => ({
    ticketNumber: item.ticket.ticket_number,
    applicantName: item.ticket.applicant_name,
    subject: item.ticket.subject,
    status: item.ticket.status,
    cachedAt: item.cachedAt,
  }));
}

/**
 * Clears all cached offline tickets.
 */
export function clearOfflineTickets(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
