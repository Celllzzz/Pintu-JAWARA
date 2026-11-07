import React, { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveVarieties } from "@/lib/services/catalog";
import { ServiceForm } from "@/components/public/ServiceForm";

interface PageProps {
  searchParams: Promise<{ kategori?: string; varietas?: string }>;
}

export default async function AjukanPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialCategoryCode = params.kategori || "";
  const initialVarietyId = params.varietas || "";

  const supabase = createAdminClient();

  const [categoriesRes, subServicesRes, varieties] = await Promise.all([
    supabase
      .from("service_categories")
      .select("id, code, name, sla_days, is_commercial")
      .is("deleted_at", null)
      .order("code", { ascending: true }),

    supabase
      .from("sub_services")
      .select("id, category_id, name")
      .is("deleted_at", null)
      .order("name", { ascending: true }),

    getActiveVarieties(),
  ]);

  const categories = categoriesRes.data || [];
  const subServices = subServicesRes.data || [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      {/* Page Title */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b] block">
          LAYANAN PUBLIK SATU PINTU
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191c19] mt-1">
          Formulir Pengajuan Permohonan Layanan
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#475447] leading-relaxed">
          Silakan lengkapi identitas dan dokumen persyaratan di bawah. E-Tiket resmi beserta nomor PIN verifikasi akan diterbitkan secara otomatis setelah formulir dikirim.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-[#d1ded0] bg-white p-8 text-center text-sm text-[#475447]">
            Memuat formulir pengajuan...
          </div>
        }
      >
        <ServiceForm
          categories={categories}
          subServices={subServices}
          varieties={varieties}
          initialCategoryCode={initialCategoryCode}
          initialVarietyId={initialVarietyId}
        />
      </Suspense>
    </main>
  );
}
