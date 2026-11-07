import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { TicketStatus } from "@/types/database";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin_l1" && user.role !== "pimpinan")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "all";
  const searchQuery = searchParams.get("q") || "";

  const supabase = createAdminClient();

  let query = supabase
    .from("tickets")
    .select(`
      id,
      ticket_number,
      applicant_name,
      whatsapp_number,
      subject,
      description,
      status,
      mechanism,
      variety_id,
      requested_quantity,
      estimated_cost,
      sla_days,
      sla_started_at,
      sla_paused_at,
      sla_total_paused_seconds,
      sla_deadline,
      completion_note,
      created_at,
      updated_at,
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
      ),
      ticket_documents (
        id,
        document_type,
        file_name,
        file_path,
        file_size_bytes,
        uploaded_by_role,
        created_at
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter as TicketStatus);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.trim();
    query = query.or(
      `ticket_number.ilike.%${q}%,applicant_name.ilike.%${q}%,subject.ilike.%${q}%`
    );
  }

  const { data: tickets, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch 8 Teams for disposisi options
  const { data: teams } = await supabase
    .from("teams")
    .select("id, code, name, description")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  return NextResponse.json({
    tickets: tickets || [],
    teams: teams || [],
  });
}
