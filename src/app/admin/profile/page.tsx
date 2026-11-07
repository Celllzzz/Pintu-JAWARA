"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  role: string;
  team_id: string | null;
  teams?: { name: string } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
          setFullName(data.user.full_name || "");
          setPhoneNumber(data.user.phone_number || "");
        }
      } catch {
        showToast("Gagal memuat profil pengguna", "error");
      } finally {
        setIsLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [router, showToast]);

  async function handleUpdateBio(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingBio(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, phone_number: phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal memperbarui profil", "error");
        return;
      }
      showToast("Data profil berhasil diperbarui.", "success");
      setProfile((prev) =>
        prev ? { ...prev, full_name: fullName, phone_number: phoneNumber } : null
      );
    } catch {
      showToast("Gangguan koneksi saat menyimpan profil", "error");
    } finally {
      setIsSavingBio(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Konfirmasi password baru tidak cocok.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Password baru minimal 8 karakter.", "error");
      return;
    }

    setIsSavingPass(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal mengganti password", "error");
        return;
      }
      showToast("Password berhasil diubah.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      showToast("Gangguan koneksi saat mengganti password", "error");
    } finally {
      setIsSavingPass(false);
    }
  }

  const roleLabel =
    profile?.role === "admin_l1"
      ? "Admin"
      : profile?.role === "admin_l2"
      ? `Petugas Unit · ${profile.teams?.name || "Pelaksana"}`
      : "Pimpinan";

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm font-medium text-[#475447]">Memuat data profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#d1ded0] bg-white p-6 shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e2e8f0] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#52792b]">
              PENGATURAN AKUN
            </span>
            <h2 className="text-xl font-bold text-[#191c19] mt-0.5">
              {profile?.full_name}
            </h2>
            <p className="text-xs text-[#475447]">{profile?.email}</p>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center rounded-full bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 text-xs font-semibold text-[#1e4f28]">
            {roleLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          <form onSubmit={handleUpdateBio} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1e4f28]">
              Informasi Personal
            </h3>

            <div>
              <label
                htmlFor="full_name"
                className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
              >
                Nama Lengkap Beserta Gelar
              </label>
              <input
                id="full_name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] px-3.5 text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="phone_number"
                className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
              >
                Nomor WhatsApp Aktif
              </label>
              <input
                id="phone_number"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="081234567890"
                className="block w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] px-3.5 font-mono tabular-nums text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingBio}
              className="flex h-11 min-h-[44px] w-full sm:w-auto items-center justify-center rounded-lg bg-[#1e4f28] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-50"
            >
              {isSavingBio ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </form>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1e4f28]">
              Keamanan Kata Sandi
            </h3>

            <div>
              <label
                htmlFor="current_password"
                className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
              >
                Password Saat Ini
              </label>
              <input
                id="current_password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] px-3.5 text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="new_password"
                className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
              >
                Password Baru (Min. 8 Karakter)
              </label>
              <input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] px-3.5 text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
              >
                Konfirmasi Password Baru
              </label>
              <input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] px-3.5 text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingPass || !newPassword}
              className="flex h-11 min-h-[44px] w-full sm:w-auto items-center justify-center rounded-lg bg-[#52792b] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#3f5e21] disabled:opacity-50"
            >
              {isSavingPass ? "Mengubah..." : "Perbarui Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
