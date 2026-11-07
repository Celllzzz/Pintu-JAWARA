import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { UnitTicketsWorkspace } from "@/components/admin-unit/UnitTicketsWorkspace";
import { FullUnitTicketData } from "@/components/admin-unit/UnitTicketDetail";

export default async function AdminUnitTicketsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "admin_l2" && !user.team_id) {
    return (
      <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-8 text-center text-xs text-[#92400e] space-y-2">
        <h2 className="text-base font-bold text-[#191c19]">Akun Belum Ditugaskan ke Unit</h2>
        <p className="max-w-md mx-auto">
          Akun Petugas Unit Anda belum dihubungkan ke salah satu dari 8 Tim Penanganan. Silakan hubungi Admin untuk mengatur penugasan tim Anda.
        </p>
      </div>
    );
  }

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
      is_sla_extended,
      sla_extension_reason,
      completion_note,
      created_at,
      service_categories (
        code,
        name,
        is_commercial
      ),
      sub_services (
        name
      ),
      varieties (
        name,
        commodity_type,
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
      ),
      ticket_billings (
        id,
        amount,
        bank_name,
        account_number,
        account_holder,
        payment_status,
        notes
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // Queue isolation: Admin L2 only sees tickets dispatched to their team
  if (user.role === "admin_l2" && user.team_id) {
    query = query.eq("team_id", user.team_id);
  }

  const { data: tickets } = await query;

  return (
    <UnitTicketsWorkspace
      initialTickets={(tickets || []) as unknown as FullUnitTicketData[]}
      teamName={user.team_name || "Unit Penanganan"}
    />
  );
}
