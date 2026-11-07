import { createAdminClient } from "@/lib/supabase/admin";
import { TicketStatus } from "@/types/database";

export interface SlaInfo {
  slaDays: number;
  isPaused: boolean;
  isOverdue: boolean;
  deadlineIso: string | null;
  remainingDays: number | null;
  remainingHours: number | null;
  formattedRemaining: string;
}

/**
 * Normalizes Date to YYYY-MM-DD string
 */
function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Checks if a given day is a weekend (Saturday or Sunday)
 */
function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * Computes deadline date based on working days (Monday-Friday, skipping holidays)
 */
export function calculateWorkingDaysDeadline(
  startDate: Date,
  workingDays: number,
  holidaySet: Set<string>
): Date {
  const current = new Date(startDate);
  let added = 0;

  while (added < workingDays) {
    current.setDate(current.getDate() + 1);
    const dateStr = toDateString(current);
    if (!isWeekend(current) && !holidaySet.has(dateStr)) {
      added++;
    }
  }

  return current;
}

/**
 * Counts remaining working days between current time and target deadline
 */
export function countRemainingWorkingDays(
  now: Date,
  deadline: Date,
  holidaySet: Set<string>
): { remainingDays: number; isOverdue: boolean } {
  if (now.getTime() > deadline.getTime()) {
    return { remainingDays: 0, isOverdue: true };
  }

  let count = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);

  while (cursor.getTime() < end.getTime()) {
    cursor.setDate(cursor.getDate() + 1);
    const dStr = toDateString(cursor);
    if (!isWeekend(cursor) && !holidaySet.has(dStr)) {
      count++;
    }
  }

  return { remainingDays: count, isOverdue: false };
}

/**
 * Computes SLA status and formatted string
 */
export function computeSlaInfo(
  ticket: {
    status: TicketStatus;
    sla_days: number;
    sla_started_at: string | null;
    sla_paused_at: string | null;
    sla_total_paused_seconds: number;
    sla_deadline: string | null;
    is_sla_extended: boolean;
  },
  holidaySet: Set<string>
): SlaInfo {
  const isPaused = ticket.status === "perlu_perbaikan";

  if (!ticket.sla_started_at) {
    return {
      slaDays: ticket.sla_days,
      isPaused,
      isOverdue: false,
      deadlineIso: null,
      remainingDays: ticket.sla_days,
      remainingHours: null,
      formattedRemaining: `Standar ${ticket.sla_days} Hari Kerja (Belum Berjalan)`,
    };
  }

  let deadline = ticket.sla_deadline
    ? new Date(ticket.sla_deadline)
    : calculateWorkingDaysDeadline(
        new Date(ticket.sla_started_at),
        ticket.sla_days,
        holidaySet
      );

  // If paused, deadline shifts by the paused duration
  if (ticket.sla_total_paused_seconds > 0) {
    deadline = new Date(
      deadline.getTime() + ticket.sla_total_paused_seconds * 1000
    );
  }

  const now = new Date();
  const { remainingDays, isOverdue } = countRemainingWorkingDays(
    now,
    deadline,
    holidaySet
  );

  let formatted = "";
  if (ticket.status === "selesai") {
    formatted = "Layanan Telah Selesai";
  } else if (isPaused) {
    formatted = `Tertunda (Perlu Perbaikan Pemohon) · Sisa ${remainingDays} Hari`;
  } else if (isOverdue) {
    formatted = "Melewati Batas Waktu (Overdue)";
  } else {
    formatted = `${remainingDays} Hari Kerja Tersisa`;
  }

  return {
    slaDays: ticket.sla_days,
    isPaused,
    isOverdue,
    deadlineIso: deadline.toISOString(),
    remainingDays,
    remainingHours: null,
    formattedRemaining: formatted,
  };
}

/**
 * Fetches all active holiday dates for working-day calculations
 */
export async function getHolidaysSet(): Promise<Set<string>> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("holidays")
    .select("date")
    .is("deleted_at", null);

  const set = new Set<string>();
  if (data) {
    data.forEach((h) => set.add(h.date));
  }
  return set;
}

export interface TicketDetailResult {
  id: string;
  ticket_number: string;
  applicant_name: string;
  whatsapp_number: string;
  subject: string;
  description: string;
  status: TicketStatus;
  mechanism: string | null;
  requested_quantity: number | null;
  estimated_cost: number | null;
  completion_note: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  category: {
    id: string;
    code: string;
    name: string;
    sla_days: number;
    is_commercial: boolean;
  } | null;
  sub_service: {
    id: string;
    name: string;
  } | null;
  team: {
    id: string;
    name: string;
    code: string;
  } | null;
  variety: {
    id: string;
    name: string;
    seed_class: string | null;
    commodity_type: string;
    price_per_unit: number;
    unit: string;
  } | null;
  documents: Array<{
    id: string;
    document_type: string;
    file_name: string;
    file_path: string;
    file_size_bytes: number | null;
    uploaded_by_role: string;
    created_at: string;
  }>;
  billing: {
    id: string;
    amount: number;
    bank_name: string;
    account_number: string;
    account_holder: string;
    payment_status: string;
    notes: string | null;
  } | null;
  survey_filled: boolean;
  audit_logs: Array<{
    id: string;
    action: string;
    old_status: string | null;
    new_status: string | null;
    actor_type: string;
    actor_name: string | null;
    notes: string | null;
    created_at: string;
  }>;
  sla: SlaInfo;
}

/**
 * Retrieves full ticket detail for public tracking
 */
export async function getTicketForTracking(
  ticketNumber: string,
  pinLast4: string
): Promise<{ success: boolean; error?: string; ticket?: TicketDetailResult }> {
  const supabase = createAdminClient();
  const cleanTicket = ticketNumber.trim().toUpperCase();
  const cleanPin = pinLast4.trim();

  // 1. Fetch base ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_number,
      applicant_name,
      whatsapp_number,
      whatsapp_pin_last4,
      subject,
      description,
      status,
      mechanism,
      requested_quantity,
      estimated_cost,
      sla_days,
      sla_started_at,
      sla_paused_at,
      sla_total_paused_seconds,
      sla_deadline,
      is_sla_extended,
      completion_note,
      created_at,
      updated_at,
      completed_at,
      service_categories (
        id,
        code,
        name,
        sla_days,
        is_commercial
      ),
      sub_services (
        id,
        name
      ),
      teams (
        id,
        name,
        code
      ),
      varieties (
        id,
        name,
        seed_class,
        commodity_type,
        price_per_unit,
        unit
      )
    `)
    .eq("ticket_number", cleanTicket)
    .is("deleted_at", null)
    .maybeSingle();

  if (ticketError || !ticket) {
    return { success: false, error: "Nomor e-tiket tidak ditemukan." };
  }

  // 2. Verify PIN last 4
  if (ticket.whatsapp_pin_last4 !== cleanPin) {
    return {
      success: false,
      error: "4 digit terakhir nomor yang digunakan saat pengajuan tidak sesuai.",
    };
  }

  // 3. Fetch related documents, billing, survey, audit logs in parallel
  const [docsRes, billingRes, surveyRes, logsRes, holidaysSet] =
    await Promise.all([
      supabase
        .from("ticket_documents")
        .select("id, document_type, file_name, file_path, file_size_bytes, uploaded_by_role, created_at")
        .eq("ticket_id", ticket.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: true }),

      supabase
        .from("ticket_billings")
        .select("id, amount, bank_name, account_number, account_holder, payment_status, notes")
        .eq("ticket_id", ticket.id)
        .is("deleted_at", null)
        .maybeSingle(),

      supabase
        .from("surveys")
        .select("id")
        .eq("ticket_id", ticket.id)
        .is("deleted_at", null)
        .maybeSingle(),

      supabase
        .from("ticket_audit_logs")
        .select("id, action, old_status, new_status, actor_type, actor_name, notes, created_at")
        .eq("ticket_id", ticket.id)
        .neq("action", "kirim_notifikasi_wa")
        .order("created_at", { ascending: true }),

      getHolidaysSet(),
    ]);

  const sla = computeSlaInfo(
    {
      status: ticket.status as TicketStatus,
      sla_days: ticket.sla_days,
      sla_started_at: ticket.sla_started_at,
      sla_paused_at: ticket.sla_paused_at,
      sla_total_paused_seconds: ticket.sla_total_paused_seconds,
      sla_deadline: ticket.sla_deadline,
      is_sla_extended: ticket.is_sla_extended,
    },
    holidaysSet
  );

  return {
    success: true,
    ticket: {
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      applicant_name: ticket.applicant_name,
      whatsapp_number: ticket.whatsapp_number,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status as TicketStatus,
      mechanism: ticket.mechanism,
      requested_quantity: ticket.requested_quantity,
      estimated_cost: ticket.estimated_cost,
      completion_note: ticket.completion_note,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      completed_at: ticket.completed_at,
      category: ticket.service_categories as unknown as TicketDetailResult["category"],
      sub_service: ticket.sub_services as unknown as TicketDetailResult["sub_service"],
      team: ticket.teams as unknown as TicketDetailResult["team"],
      variety: ticket.varieties as unknown as TicketDetailResult["variety"],
      documents: docsRes.data || [],
      billing: billingRes.data || null,
      survey_filled: Boolean(surveyRes.data),
      audit_logs: (logsRes.data as unknown as TicketDetailResult["audit_logs"]) || [],
      sla,
    },
  };
}
