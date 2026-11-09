# Pintu-JAWARA (Pusat Informasi Terpadu)

Portal Layanan Publik dan Informasi Terpadu BRMP Banten. Dibangun menggunakan **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, dan **Supabase (PostgreSQL)** untuk digitalisasi alur permohonan layanan, pelacakan tiket mandiri, e-billing PNBP, dan monitoring kinerja real-time.

---

## Fitur Utama

- **Layanan Publik & Permohonan Online**:
  - Formulir permohonan adaptif untuk 6 unit layanan (UPBS Benih Sumber, Laboratorium Terpadu, Konsultasi/Rekomendasi Teknis, Magang/PKL, Kunjungan Edukasi, dan Permohonan Informasi Publik).
  - Unggah dokumen persyaratan langsung ke penyimpanan terproteksi Supabase Storage.
  - Alokasi otomatis nomor tiket unik dan token keamanan pelacakan.
- **Katalog Benih UPBS & Kontrol Stok Atomik**:
  - Tampilan varietas benih sumber dengan batch dan masa kedaluwarsa.
  - Mekanisme penahanan stok sementara (*hold stock*) dan pemotongan stok otomatis (*atomic concurrency transaction*) dengan metode FIFO untuk mencegah *overselling*.
- **Pelacakan Tiket & Notifikasi WhatsApp**:
  - Pelacakan status mandiri oleh pemohon secara real-time via kode tiket & OTP/token WA.
  - Notifikasi instan via WhatsApp Gateway di setiap perubahan status tiket (verifikasi, revisi, billing, proses, selesai).
- **Workspace Multi-Peran (RBAC)**:
  - **Admin Verifikator**: Validasi kelengkapan berkas, disposisi tiket ke unit kerja, atau permintaan revisi berkas ke pemohon.
  - **Petugas Unit Layanan**: Penerbitan e-billing PNBP, verifikasi pembayaran, pelaksanaan teknis, perpanjangan SLA, hingga penyelesaian tiket dan penyerahan output.
  - **Pimpinan**: Dashboard eksekutif analitik KPI, monitoring SLA & tiket jatuh tempo, rekapitulasi Survei Kepuasan Masyarakat (SKM), serta ekspor laporan berkala (CSV & Print-ready layout).
- **Survei Kepuasan Masyarakat (SKM)**:
  - Terintegrasi PermenPAN-RB No. 14/2017 dengan 9 unsur pelayanan Likert 4 poin dan demografi responden.
- **Perhitungan SLA Dinamis**:
  - Perhitungan jam kerja operasional kantor resmi (Senin–Kamis 09.00–15.00 WIB [Istirahat 12.00–13.00], Jumat 09.00–15.30 WIB [Istirahat 11.00–13.00], Sabtu–Minggu Libur).
- **PWA & Offline Support**:
  - Service Worker dengan IndexedDB lokal untuk caching draft permohonan saat koneksi terputus.
- **Keamanan & Kepatuhan**:
  - Rate limiting berbasis in-memory & IP untuk pencegahan *brute-force* pada endpoint kritis.
  - OWASP Content Security Policy (CSP), Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options.
  - Row Level Security (RLS) PostgreSQL untuk isolasi hak akses data.

---

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Bahasa** | TypeScript 5 |
| **Frontend** | React 19, Tailwind CSS v4, Lucide Icons |
| **Database & Auth** | Supabase (PostgreSQL 15+, RLS, SSR Auth Helpers) |
| **Storage** | Supabase Storage (Private Buckets & Signed URLs) |
| **Notifikasi** | WhatsApp Gateway HTTP Adapter (Fonnte Compatible) |
| **Tooling & Test** | Node.js 20+, `tsx`, ESLint 9 |

---

## Struktur Direktori

```text
├── public/                 # Favicon, ikon PWA, manifest, dan logo vektor
├── scripts/                # Database migrations, seeders, dan E2E test suites
│   ├── migrate.ts
│   ├── seed-catalog.ts
│   ├── test-e2e-scenarios.ts
│   └── verify-production-readiness.ts
├── src/
│   ├── app/                # Next.js App Router (Public, Admin, Unit, Pimpinan, API)
│   ├── components/         # Modul UI (Public, Admin, Pimpinan, Survey, Shared UI)
│   ├── lib/                # Layanan internal, Supabase client/server, Auth, WhatsApp
│   ├── proxy.ts            # Next.js proxy middleware (Auth & Route protection)
│   └── types/              # Deklarasi tipe TypeScript & skema database
├── supabase/               # Skema DDL SQL, RLS policies, dan storage configuration
└── next.config.ts          # Security headers & CSP configuration
```

---

## Panduan Instalasi Lokal

### 1. Prasyarat
- Node.js versi 20.x atau lebih baru
- npm versi 10.x atau lebih baru
- Akun Supabase (project PostgreSQL aktif)

### 2. Kloning Repositori & Instalasi Dependensi
```bash
git clone https://github.com/Celllzzz/Pintu-JAWARA.git
cd Pintu-JAWARA
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas `.env.example` ke `.env.local` (atau `.env`):
```bash
cp .env.example .env.local
```

Sesuaikan variabel berikut di `.env.local`:
```env
# URL Aplikasi
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DIRECT_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Keamanan Sesi
SESSION_SECRET=min-32-character-random-hex-string
TICKET_TOKEN_SECRET=min-32-character-random-hex-string

# WhatsApp Gateway
WA_GATEWAY_URL=https://api.fonnte.com/send
WA_GATEWAY_TOKEN=your-wa-token
```

### 4. Migrasi Database & Seeding
Jalankan skrip migrasi untuk mengeksekusi DDL, RLS policies, dan akun awal:
```bash
npm run db:migrate
npx tsx scripts/seed-catalog.ts
```

### 5. Menjalankan Aplikasi
```bash
# Development mode
npm run dev

# Production build & run
npm run build
npm run start
```
Aplikasi dapat diakses melalui `http://localhost:3000`.

---

## Verifikasi & Pengujian

Proyek ini dilengkapi dengan serangkaian automated integration & unit verification:
```bash
# Audit kesiapan pra-rilis produksi (Security, Envs, Indexes)
npx tsx scripts/verify-production-readiness.ts

# Verifikasi indeks basis data PostgreSQL
npx tsx scripts/verify-db-indexes.ts

# Pengujian alur tiket lengkap E2E
npx tsx scripts/test-e2e-scenarios.ts

# Pengujian keamanan RBAC & proteksi endpoint
npx tsx scripts/test-security-rbac.ts

# Pengujian konkurensi stok (Race Condition Defense)
npx tsx scripts/test-concurrency-stock.ts
```

---

## Lisensi & Hak Cipta
Hak Cipta © 2025 Balai Penerapan Standar Instrumen Pertanian (BPSIP) Jawa Barat - Kementerian Pertanian Republik Indonesia.
