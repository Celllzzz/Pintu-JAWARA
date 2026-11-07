import React from "react";
import Link from "next/link";
import {
  Sprout,
  FileText,
  GraduationCap,
  BookOpen,
  FlaskConical,
  Cpu,
  MessageSquareWarning,
  Users,
  ArrowRight,
} from "lucide-react";
import { HeroSection } from "@/components/public/HeroSection";

interface ServiceItem {
  code: string;
  title: string;
  description: string;
  sla: string;
  subServices: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const services: ServiceItem[] = [
  {
    code: "BS",
    title: "Benih & Bibit Sumber",
    description: "Penyediaan benih padi varietas unggul (SS/FS) & bibit ayam bersertifikat.",
    sla: "Standar 5 Hari Kerja",
    subServices: ["Benih Padi", "Bibit Ayam"],
    icon: Sprout,
  },
  {
    code: "IP",
    title: "Informasi Publik (PPID)",
    description: "Permohonan akses informasi publik resmi berkala, serta merta, dan setiap saat.",
    sla: "Standar 10 Hari Kerja",
    subServices: ["Informasi Berkala", "Informasi Serta Merta", "Informasi Setiap Saat"],
    icon: FileText,
  },
  {
    code: "MP",
    title: "Magang & PKL",
    description: "Fasilitasi praktik kerja lapangan (PKL) SLTA dan magang mahasiswa perguruan tinggi.",
    sla: "Standar 7 Hari Kerja",
    subServices: ["Magang Perguruan Tinggi", "PKL SLTA"],
    icon: GraduationCap,
  },
  {
    code: "KE",
    title: "Kunjungan Edukasi",
    description: "Wisata edukasi pertanian modern di Taman Agromodern dan akses perpustakaan.",
    sla: "Standar 5 Hari Kerja",
    subServices: ["Taman Agromodern", "Perpustakaan"],
    icon: BookOpen,
  },
  {
    code: "PK",
    title: "Pengujian & Laboratorium",
    description: "Analisis laboratorium mutu beras, uji unsur hara tanah, dan pendampingan teknis.",
    sla: "Standar 14 Hari Kerja",
    subServices: ["Uji Mutu Beras", "Uji Hara Tanah", "Pendampingan Teknis"],
    icon: FlaskConical,
  },
  {
    code: "KT",
    title: "Konsultasi Teknologi",
    description: "Pendampingan teknologi pertanian spesifik lokasi dan fasilitasi penerapan inovasi.",
    sla: "Standar 3 Hari Kerja",
    subServices: ["Teknologi Spesifik Lokasi", "Budidaya & Benih", "Fasilitasi Penerapan"],
    icon: Cpu,
  },
  {
    code: "PA",
    title: "Pengaduan & Aspirasi",
    description: "Kanal penyampaian saran, aspirasi, dan pengaduan layanan terpadu masyarakat.",
    sla: "Standar 5 Hari Kerja",
    subServices: ["Pengaduan Layanan", "Aspirasi Publik"],
    icon: MessageSquareWarning,
  },
  {
    code: "PB",
    title: "Pelatihan & Bimtek",
    description: "Bimbingan teknis peningkatan kapasitas kelembagaan dan perencanaan pertanian.",
    sla: "Standar 7 Hari Kerja",
    subServices: ["Pendampingan Perencanaan", "Pelatihan Kapasitas"],
    icon: Users,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
      {/* 1. Hero Section with Integrated Track Form */}
      <HeroSection />

      {/* 2. Grid 8 Kategori Layanan Publik */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 border-b border-[#e2e8f0] pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#52792b]">
              MENU LAYANAN PUBLIK
            </span>
            <h2 className="text-xl font-bold text-[#191c19] mt-0.5">
              8 Kategori Layanan BRMP Banten
            </h2>
          </div>
          <p className="text-xs text-[#475447]">
            Pilih layanan untuk membuka formulir permohonan online
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <Link
                key={svc.code}
                href={`/ajukan?kategori=${svc.code}`}
                className="group flex flex-col justify-between rounded-xl border border-[#d1ded0] bg-white p-5 transition-all hover:border-[#1e4f28] hover:shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f8faf4] border border-[#d1ded0] text-[#1e4f28] group-hover:bg-[#1e4f28] group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-[#52792b]">
                      SL-{svc.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#191c19] group-hover:text-[#1e4f28] transition-colors leading-snug">
                      {svc.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#475447] leading-relaxed line-clamp-2">
                      {svc.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {svc.subServices.map((sub) => (
                      <span
                        key={sub}
                        className="rounded bg-[#f8faf4] border border-[#e2e8f0] px-1.5 py-0.5 text-[10px] text-[#475447]"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#52792b] text-[11px] tracking-tight">
                    {svc.sla}
                  </span>
                  <span className="flex items-center text-[#1e4f28] font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                    <span>Ajukan</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
