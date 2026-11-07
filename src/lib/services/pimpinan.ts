import { createAdminClient } from "@/lib/supabase/admin";

export interface KPIMetricsResult {
  totalTickets: number;
  completedTickets: number;
  inProgressTickets: number;
  overdueTickets: number;
  slaComplianceRate: number; // percentage (0 - 100)
  averageCompletionDays: number; // in days
  currentIKM: number | null; // scale 25 - 100
  currentGrade: string | null; // 'A', 'B', 'C', 'D'
  totalSurveys: number;
  complaintResolutionRate: number; // percentage (0 - 100)
}

export interface OverdueTicketItem {
  id: string;
  ticket_number: string;
  applicant_name: string;
  subject: string;
  status: string;
  sla_deadline: string | null;
  overdueDays: number;
  category_name: string;
  team_name: string;
}

export interface Report8ColumnItem {
  tanggal_pengajuan: string;
  tanggal_penyelesaian: string;
  nomor_e_tiket: string;
  jenis_layanan: string;
  nama_pemohon: string;
  nomor_whatsapp: string;
  perihal: string;
  tim_penanganan: string;
}

export function formatExportTimestamp(d = new Date()): string {
  const dateFormatted = d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFormatted = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${dateFormatted}, Pukul ${timeFormatted} WIB`;
}

/**
 * Aggregates live system KPI metrics for executive dashboard
 */
export async function getLiveKPIMetrics(): Promise<KPIMetricsResult> {
  const supabase = createAdminClient();
  const now = new Date();
  const nowIso = now.toISOString();

  const [ticketsRes, surveysRes, complaintRes] = await Promise.all([
    supabase
      .from("tickets")
      .select("id, status, created_at, completed_at, sla_deadline, sla_started_at")
      .is("deleted_at", null),

    supabase
      .from("surveys")
      .select("ikm_score")
      .is("deleted_at", null),

    supabase
      .from("tickets")
      .select("id, status, service_categories!inner(code)")
      .eq("service_categories.code", "PA")
      .is("deleted_at", null),
  ]);

  const tickets = ticketsRes.data || [];
  const surveys = surveysRes.data || [];
  const complaints = complaintRes.data || [];

  const totalTickets = tickets.length;
  const completedTickets = tickets.filter((t) => t.status === "selesai").length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === "diproses" || t.status === "disposisi"
  ).length;

  const overdueTickets = tickets.filter((t) => {
    if (t.status === "selesai") return false;
    return t.sla_deadline && t.sla_deadline < nowIso;
  }).length;

  // SLA Compliance: % of completed tickets where completed_at <= sla_deadline
  let compliantCount = 0;
  let totalCompletionDaysSum = 0;
  let completedCountWithDates = 0;

  tickets.forEach((t) => {
    if (t.status === "selesai" && t.completed_at) {
      if (!t.sla_deadline || t.completed_at <= t.sla_deadline) {
        compliantCount++;
      }
      const start = new Date(t.sla_started_at || t.created_at).getTime();
      const end = new Date(t.completed_at).getTime();
      const days = Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
      totalCompletionDaysSum += days;
      completedCountWithDates++;
    }
  });

  const slaComplianceRate =
    completedTickets > 0
      ? Number(((compliantCount / completedTickets) * 100).toFixed(1))
      : 100;

  const averageCompletionDays =
    completedCountWithDates > 0
      ? Number((totalCompletionDaysSum / completedCountWithDates).toFixed(1))
      : 0;

  // IKM from current system surveys
  let currentIKM: number | null = null;
  let currentGrade: string | null = null;

  if (surveys.length > 0) {
    const sum = surveys.reduce((acc, s) => acc + Number(s.ikm_score), 0);
    currentIKM = Number((sum / surveys.length).toFixed(2));

    if (currentIKM >= 88.31) currentGrade = "A (Sangat Baik)";
    else if (currentIKM >= 76.61) currentGrade = "B (Baik)";
    else if (currentIKM >= 65.0) currentGrade = "C (Kurang Baik)";
    else currentGrade = "D (Tidak Baik)";
  }

  // Complaint resolution rate
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((c) => c.status === "selesai").length;
  const complaintResolutionRate =
    totalComplaints > 0
      ? Number(((resolvedComplaints / totalComplaints) * 100).toFixed(1))
      : 100;

  return {
    totalTickets,
    completedTickets,
    inProgressTickets,
    overdueTickets,
    slaComplianceRate,
    averageCompletionDays,
    currentIKM,
    currentGrade,
    totalSurveys: surveys.length,
    complaintResolutionRate,
  };
}

/**
 * Retrieves list of active overdue tickets
 */
export async function getOverdueTickets(): Promise<OverdueTicketItem[]> {
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data } = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_number,
      applicant_name,
      subject,
      status,
      sla_deadline,
      service_categories (name),
      teams (name)
    `)
    .neq("status", "selesai")
    .lt("sla_deadline", nowIso)
    .is("deleted_at", null)
    .order("sla_deadline", { ascending: true });

  if (!data) return [];

  const nowMs = Date.now();

  return data.map((t) => {
    const deadlineMs = t.sla_deadline ? new Date(t.sla_deadline).getTime() : nowMs;
    const diffDays = Math.max(1, Math.ceil((nowMs - deadlineMs) / (1000 * 60 * 60 * 24)));

    return {
      id: t.id,
      ticket_number: t.ticket_number,
      applicant_name: t.applicant_name,
      subject: t.subject,
      status: t.status,
      sla_deadline: t.sla_deadline,
      overdueDays: diffDays,
      category_name:
        (t.service_categories as unknown as { name: string })?.name || "—",
      team_name: (t.teams as unknown as { name: string })?.name || "Belum Didisposisi",
    };
  });
}

/**
 * Retrieves standard 8-column official report rows
 */
export async function getReport8ColumnData(params?: {
  range?: string;
  categoryCode?: string;
}): Promise<Report8ColumnItem[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("tickets")
    .select(`
      created_at,
      completed_at,
      ticket_number,
      applicant_name,
      whatsapp_number,
      subject,
      service_categories!inner (
        code,
        name
      ),
      teams (
        name
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (params?.categoryCode && params.categoryCode !== "all") {
    query = query.eq("service_categories.code", params.categoryCode);
  }

  // Filter time range if specified
  if (params?.range && params.range !== "all") {
    const now = new Date();
    let startDate: Date | null = null;

    if (params.range === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (params.range === "quarter") {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), qMonth, 1);
    } else if (params.range === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    if (startDate) {
      query = query.gte("created_at", startDate.toISOString());
    }
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    tanggal_pengajuan: new Date(row.created_at).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    tanggal_penyelesaian: row.completed_at
      ? new Date(row.completed_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—",
    nomor_e_tiket: row.ticket_number,
    jenis_layanan:
      (row.service_categories as unknown as { name: string })?.name || "—",
    nama_pemohon: row.applicant_name,
    nomor_whatsapp: row.whatsapp_number,
    perihal: row.subject,
    tim_penanganan:
      (row.teams as unknown as { name: string })?.name || "Belum Didisposisi",
  }));
}
