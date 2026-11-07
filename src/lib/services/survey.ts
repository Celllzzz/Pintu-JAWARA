import { createAdminClient } from "@/lib/supabase/admin";

export interface SurveySubmissionPayload {
  ticket_id: string;
  contact_number?: string | null;
  service_type: string;
  gender: "Laki-Laki" | "Perempuan";
  education: string;
  age_range: string;
  occupation: string;
  is_disabled: boolean;
  disability_type?: string | null;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
  q8: number;
  q9: number;
  q10: number;
  q11: number;
  q12: number;
  q13: number;
  q14: number;
  q15: number;
  q16: number;
  feedback?: string | null;
}

export interface IKMCalculationResult {
  averageScore: number;
  ikmScore: number;
  serviceGrade: "A" | "B" | "C" | "D";
  gradeLabel: string;
}

/**
 * Calculates average R, IKM score (scale 25-100), and letter grade (A/B/C/D)
 */
export function calculateIKM(questions: number[]): IKMCalculationResult {
  if (questions.length !== 16) {
    throw new Error("Kuesioner survei harus terdiri dari 16 instrumen.");
  }

  const sum = questions.reduce((acc, q) => acc + q, 0);
  const averageScore = Number((sum / 16).toFixed(4));
  const ikmScore = Number((averageScore * 25).toFixed(2));

  let serviceGrade: "A" | "B" | "C" | "D" = "D";
  let gradeLabel = "Tidak Baik";

  if (ikmScore >= 88.31) {
    serviceGrade = "A";
    gradeLabel = "Sangat Baik";
  } else if (ikmScore >= 76.61) {
    serviceGrade = "B";
    gradeLabel = "Baik";
  } else if (ikmScore >= 65.0) {
    serviceGrade = "C";
    gradeLabel = "Kurang Baik";
  }

  return { averageScore, ikmScore, serviceGrade, gradeLabel };
}

/**
 * Submits survey to database and updates audit log
 */
export async function submitSurvey(
  payload: SurveySubmissionPayload
): Promise<{ success: boolean; error?: string; calculation?: IKMCalculationResult }> {
  const supabase = createAdminClient();

  // 1. Verify ticket status
  const { data: ticket, error: ticketErr } = await supabase
    .from("tickets")
    .select("id, ticket_number, status, applicant_name")
    .eq("id", payload.ticket_id)
    .is("deleted_at", null)
    .single();

  if (ticketErr || !ticket) {
    return { success: false, error: "Tiket permohonan tidak ditemukan." };
  }

  if (ticket.status !== "selesai") {
    return {
      success: false,
      error: "Survei hanya dapat diisi untuk permohonan yang telah berstatus Selesai.",
    };
  }

  // 2. Check if already submitted
  const { data: existingSurvey } = await supabase
    .from("surveys")
    .select("id")
    .eq("ticket_id", ticket.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingSurvey) {
    return {
      success: false,
      error: "Survei kepuasan masyarakat untuk permohonan ini sudah pernah diisi.",
    };
  }

  // 3. Calculate scores
  const questionScores = [
    payload.q1,
    payload.q2,
    payload.q3,
    payload.q4,
    payload.q5,
    payload.q6,
    payload.q7,
    payload.q8,
    payload.q9,
    payload.q10,
    payload.q11,
    payload.q12,
    payload.q13,
    payload.q14,
    payload.q15,
    payload.q16,
  ];

  const calculation = calculateIKM(questionScores);

  // 4. Insert survey record
  const { error: insertErr } = await supabase.from("surveys").insert({
    ticket_id: ticket.id,
    contact_number: payload.contact_number?.trim() || null,
    service_type: payload.service_type.trim(),
    gender: payload.gender,
    education: payload.education.trim(),
    age_range: payload.age_range.trim(),
    occupation: payload.occupation.trim(),
    is_disabled: payload.is_disabled,
    disability_type: payload.is_disabled ? payload.disability_type?.trim() || null : null,
    q1: payload.q1,
    q2: payload.q2,
    q3: payload.q3,
    q4: payload.q4,
    q5: payload.q5,
    q6: payload.q6,
    q7: payload.q7,
    q8: payload.q8,
    q9: payload.q9,
    q10: payload.q10,
    q11: payload.q11,
    q12: payload.q12,
    q13: payload.q13,
    q14: payload.q14,
    q15: payload.q15,
    q16: payload.q16,
    feedback: payload.feedback?.trim() || null,
    average_score: calculation.averageScore,
    ikm_score: calculation.ikmScore,
    service_grade: calculation.serviceGrade,
  });

  if (insertErr) {
    return { success: false, error: `Gagal menyimpan survei: ${insertErr.message}` };
  }

  // 5. Insert audit log
  await supabase.from("ticket_audit_logs").insert({
    ticket_id: ticket.id,
    action: "isi_survei_skm",
    old_status: ticket.status,
    new_status: ticket.status,
    actor_type: "pemohon",
    actor_name: ticket.applicant_name,
    notes: `Pemohon telah mengisi kuesioner SKM (Skor IKM: ${calculation.ikmScore} - Mutu ${calculation.serviceGrade}). Akses unduh hasil dibuka.`,
    metadata: {
      ikm_score: calculation.ikmScore,
      service_grade: calculation.serviceGrade,
      q6_score: payload.q6,
    },
  });

  return { success: true, calculation };
}
