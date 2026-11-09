import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  SurveyExportWorkspace,
  SurveyRowItem,
} from "@/components/admin/survey/SurveyExportWorkspace";

export default async function AdminSurveiPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin_l1") {
    redirect(user ? "/admin/tickets" : "/login");
  }

  const supabase = createAdminClient();

  const { data: surveys, error } = await supabase
    .from("surveys")
    .select(`
      id,
      created_at,
      contact_number,
      service_type,
      gender,
      education,
      age_range,
      occupation,
      is_disabled,
      disability_type,
      average_score,
      ikm_score,
      service_grade,
      feedback,
      tickets (
        ticket_number,
        applicant_name,
        whatsapp_number
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (surveys || []) as unknown as SurveyRowItem[];
  const total = rows.length;
  const avgScore =
    total > 0
      ? Number(
          (
            rows.reduce((acc, s) => acc + Number(s.ikm_score), 0) / total
          ).toFixed(2)
        )
      : null;

  let overallGrade = "—";
  if (avgScore !== null) {
    if (avgScore >= 88.31) overallGrade = "A (Sangat Baik)";
    else if (avgScore >= 76.61) overallGrade = "B (Baik)";
    else if (avgScore >= 65.0) overallGrade = "C (Kurang Baik)";
    else overallGrade = "D (Tidak Baik)";
  }

  return (
    <SurveyExportWorkspace
      initialSurveys={rows}
      initialTotal={total}
      initialAverageIkm={avgScore}
      initialGrade={overallGrade}
    />
  );
}
