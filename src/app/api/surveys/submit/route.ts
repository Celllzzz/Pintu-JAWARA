import { NextRequest, NextResponse } from "next/server";
import { submitSurvey, SurveySubmissionPayload } from "@/lib/services/survey";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const requiredFields = [
      "ticket_id",
      "service_type",
      "gender",
      "education",
      "age_range",
      "occupation",
    ];

    for (const f of requiredFields) {
      if (!body[f]) {
        return NextResponse.json(
          { error: `Field '${f}' wajib diisi.` },
          { status: 400 }
        );
      }
    }

    // Verify 16 questions are valid scores between 1 and 4
    for (let i = 1; i <= 16; i++) {
      const qVal = body[`q${i}`];
      if (typeof qVal !== "number" || qVal < 1 || qVal > 4) {
        return NextResponse.json(
          { error: `Instrumen pertanyaan Q${i} harus bernilai antara 1 sampai 4.` },
          { status: 400 }
        );
      }
    }

    const payload: SurveySubmissionPayload = {
      ticket_id: body.ticket_id,
      contact_number: body.contact_number || null,
      service_type: body.service_type,
      gender: body.gender,
      education: body.education,
      age_range: body.age_range,
      occupation: body.occupation,
      is_disabled: Boolean(body.is_disabled),
      disability_type: body.disability_type || null,
      q1: body.q1,
      q2: body.q2,
      q3: body.q3,
      q4: body.q4,
      q5: body.q5,
      q6: body.q6,
      q7: body.q7,
      q8: body.q8,
      q9: body.q9,
      q10: body.q10,
      q11: body.q11,
      q12: body.q12,
      q13: body.q13,
      q14: body.q14,
      q15: body.q15,
      q16: body.q16,
      feedback: body.feedback || null,
    };

    const result = await submitSurvey(payload);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Survei kepuasan masyarakat berhasil dikirim. Terima kasih atas evaluasi Anda.",
      calculation: result.calculation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
