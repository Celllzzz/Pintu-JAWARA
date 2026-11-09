import React from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { SurveyFormContainer } from "@/components/survey/SurveyFormContainer";

interface PageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function SurveyTicketPage({ params }: PageProps) {
  const { ticketId } = await params;
  const supabase = createAdminClient();

  const [ticketRes, surveyRes] = await Promise.all([
    supabase
      .from("tickets")
      .select(`
        id,
        ticket_number,
        status,
        applicant_name,
        whatsapp_number,
        whatsapp_pin_last4,
        service_categories (code, name),
        sub_services (name)
      `)
      .eq("id", ticketId)
      .is("deleted_at", null)
      .single(),

    supabase
      .from("surveys")
      .select("id")
      .eq("ticket_id", ticketId)
      .is("deleted_at", null)
      .maybeSingle(),
  ]);

  const ticket = ticketRes.data;

  if (!ticket) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-[#191c19]">Permohonan Tidak Ditemukan</h1>
        <p className="text-xs text-[#475447]">
          Data permohonan yang Anda tuju tidak ditemukan di sistem Pintu JAWARA.
        </p>
        <Link
          href="/lacak"
          className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-[#1e4f28] px-5 text-xs font-semibold text-white hover:bg-[#163c1e]"
        >
          Ke Halaman Pelacakan
        </Link>
      </main>
    );
  }

  if (ticket.status !== "selesai") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-[#191c19]">Permohonan Belum Selesai</h1>
        <p className="text-xs text-[#475447] leading-relaxed">
          Survei Kepuasan Masyarakat (SKM) hanya dapat diisi setelah permohonan layanan berstatus{" "}
          <strong className="text-[#191c19]">Selesai</strong>. Saat ini tiket Anda masih dalam tahapan{" "}
          <span className="font-semibold uppercase text-[#52792b]">{ticket.status}</span>.
        </p>
        <Link
          href={`/lacak?ticket=${ticket.ticket_number}&pin=${ticket.whatsapp_pin_last4}`}
          className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-[#1e4f28] px-5 text-xs font-semibold text-white hover:bg-[#163c1e]"
        >
          Lihat Progres Tiket
        </Link>
      </main>
    );
  }

  // Determine default service type
  const catCode = (ticket.service_categories as unknown as { code: string })?.code;
  const subName = (ticket.sub_services as unknown as { name: string })?.name || "";

  let defaultServiceType = "Konsultasi";
  if (catCode === "BS") {
    defaultServiceType = subName.toLowerCase().includes("ayam") ? "UPBS Ayam" : "UPBS Padi";
  } else if (catCode === "PK") {
    defaultServiceType = "Laboratorium Pengujian";
  } else if (catCode === "MP") {
    defaultServiceType = "Magang/PKL";
  } else if (catCode === "KE") {
    defaultServiceType = subName.toLowerCase().includes("perpustakaan") ? "Perpustakaan" : "Taman Agromodern";
  } else if (catCode === "KT" || catCode === "PB") {
    defaultServiceType = "Pendampingan";
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      <div>
        <Link
          href={`/lacak?ticket=${ticket.ticket_number}&pin=${ticket.whatsapp_pin_last4}`}
          className="text-xs font-semibold text-[#52792b] hover:underline"
        >
          Kembali ke Detail Permohonan
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b] block mt-2">
          EVALUASI PELAYANAN PUBLIK
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191c19] mt-0.5">
          Survei Kepuasan Masyarakat (SKM)
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#475447] leading-relaxed">
          Mohon berikan penilaian objektif Anda atas pelayanan permohonan tiket{" "}
          <strong className="font-mono tabular-nums text-[#191c19]">{ticket.ticket_number}</strong>.
          Evaluasi Anda sangat berharga bagi peningkatan mutu layanan BRMP Banten.
        </p>
      </div>

      <SurveyFormContainer
        ticket={{
          id: ticket.id,
          ticket_number: ticket.ticket_number,
          applicant_name: ticket.applicant_name,
          whatsapp_number: ticket.whatsapp_number,
          whatsapp_pin_last4: ticket.whatsapp_pin_last4,
          default_service_type: defaultServiceType,
          is_already_filled: Boolean(surveyRes.data),
        }}
      />
    </main>
  );
}
