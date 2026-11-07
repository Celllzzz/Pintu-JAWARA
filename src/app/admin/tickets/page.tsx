import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminTicketsWorkspace } from "@/components/admin/AdminTicketsWorkspace";
import { FullTicketData } from "@/components/admin/AdminTicketDetail";

export default async function AdminTicketsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin_l1" && user.role !== "pimpinan")) {
    redirect("/login");
  }

  const supabase = createAdminClient();

  const [ticketsRes, teamsRes] = await Promise.all([
    supabase
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
        completion_note,
        created_at,
        service_categories (
          code,
          name
        ),
        sub_services (
          name
        ),
        teams (
          id,
          name,
          code
        ),
        varieties (
          name,
          commodity_type,
          unit,
          price_per_unit
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
      .order("created_at", { ascending: false }),

    supabase
      .from("teams")
      .select("id, code, name, description")
      .is("deleted_at", null)
      .order("name", { ascending: true }),
  ]);

  const initialTickets = (ticketsRes.data || []) as unknown as FullTicketData[];
  const teams = teamsRes.data || [];

  return (
    <AdminTicketsWorkspace
      initialTickets={initialTickets}
      teams={teams}
    />
  );
}
