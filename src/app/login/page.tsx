"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft, Lock } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal masuk. Periksa email dan password.");
        showToast(data.error || "Login gagal", "error");
        return;
      }

      showToast("Berhasil masuk. Mengalihkan...", "success");
      const target = returnUrl || data.redirectUrl || "/admin/tickets";
      window.location.href = target;
    } catch {
      setErrorMessage("Terjadi gangguan koneksi. Silakan coba kembali.");
      showToast("Gangguan koneksi jaringan", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#d1ded0] bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3 border-b border-[#e2e8f0] pb-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#1e4f28]">
          <Lock className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#191c19]">Autentikasi Petugas</h2>
          <p className="text-[11px] text-[#475447]">Gunakan akun resmi yang terdaftar</p>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-xs font-medium text-[#991b1b]"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold uppercase tracking-wider text-[#191c19]"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="mt-1 block w-full h-10 min-h-[40px] rounded-lg border border-[#d1ded0] px-3.5 text-xs sm:text-sm text-[#191c19] placeholder:text-[#475447]/60 focus:border-[#1e4f28] focus:outline-none focus:ring-1 focus:ring-[#1e4f28]"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-bold uppercase tracking-wider text-[#191c19]"
          >
            Kata Sandi
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full h-10 min-h-[40px] rounded-lg border border-[#d1ded0] pl-3.5 pr-11 text-xs sm:text-sm text-[#191c19] placeholder:text-[#475447]/60 focus:border-[#1e4f28] focus:outline-none focus:ring-1 focus:ring-[#1e4f28]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute inset-y-0 right-0 flex h-10 w-10 items-center justify-center text-[#475447] hover:text-[#191c19] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f28] rounded-r-lg"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full h-10 min-h-[40px] items-center justify-center rounded-lg bg-[#1e4f28] px-4 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#163c1e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f28] active:scale-[0.99] disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Memeriksa Akun..." : "Masuk ke Sistem"}
        </button>
      </form>

      <div className="mt-4 border-t border-[#e2e8f0] pt-3 text-center space-y-1.5">
        <p className="text-[11px] text-[#475447]">
          Akses portal ini khusus untuk petugas dan pimpinan BRMP Banten.
        </p>
        <div>
          <Link
            href="/lacak"
            className="inline-block text-xs font-semibold text-[#1e4f28] hover:underline"
          >
            Masyarakat umum melacak berkas? Buka Lacak Tiket →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden flex-col justify-between bg-[#f8faf4] px-4 py-3 sm:px-6 lg:px-8">
      {/* Top Header Navigation */}
      <div className="mx-auto w-full max-w-4xl flex items-center justify-between shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e4f28] hover:text-[#163c1e] hover:underline min-h-[36px] py-1 px-1 focus-visible:outline-2 focus-visible:outline-[#1e4f28]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </Link>
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#475447]">
          Zona Integritas WBK
        </span>
      </div>

      {/* Main Container */}
      <div className="mx-auto w-full max-w-md my-auto py-2">
        {/* Brand Header */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="inline-flex items-center justify-center p-1.5 rounded-xl bg-white border border-[#d1ded0] shadow-2xs mb-2">
            <Image
              src="/logo/Kementerian Pertanian Kementan Logo - Colored - zonalogo.com.svg"
              alt="Logo Kementerian Pertanian"
              width={40}
              height={40}
              priority
              className="h-10 w-auto object-contain"
            />
          </div>

          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#52792b]">
            BRMP BANTEN
          </p>
          <h1 className="mt-0.5 text-xl sm:text-2xl font-extrabold tracking-tight text-[#191c19] text-balance">
            Pintu JAWARA
          </h1>
          <p className="mt-1 text-xs text-[#475447] text-balance">
            Pusat Informasi Terpadu
          </p>
        </div>

        {/* Login Card */}
        <Suspense
          fallback={
            <div className="rounded-xl border border-[#d1ded0] bg-white p-6 text-center text-xs text-[#475447]">
              Memuat formulir login...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-md py-1.5 text-center text-[11px] text-[#475447] space-y-0.5 shrink-0">
        <p>© 2026 BRMP Banten · Pusat Informasi Terpadu</p>
        <p className="text-[10px] text-[#475447]/80">Balai Besar Penerapan Modernisasi Pertanian - Kementerian Pertanian</p>
      </footer>
    </div>
  );
}
