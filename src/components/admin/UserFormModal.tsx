"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { CustomSelect } from "@/components/ui/CustomSelect";

export interface TeamItem {
  id: string;
  name: string;
  code: string;
}

export interface UserItem {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  role: "admin_l1" | "admin_l2" | "pimpinan";
  team_id: string | null;
  is_active: boolean;
  created_at: string;
  teams?: { id: string; name: string; code: string } | null;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: UserItem | null;
  teams: TeamItem[];
  onSuccess: () => void;
}

export function UserFormModal(props: UserFormModalProps) {
  if (!props.isOpen) return null;
  return <UserFormDialogContent key={props.editingUser?.id || "new"} {...props} />;
}

function UserFormDialogContent({
  onClose,
  editingUser,
  teams,
  onSuccess,
}: UserFormModalProps) {
  const { showToast } = useToast();

  const [formEmail, setFormEmail] = useState(() => editingUser?.email || "");
  const [formFullName, setFormFullName] = useState(() => editingUser?.full_name || "");
  const [formPhone, setFormPhone] = useState(() => editingUser?.phone_number || "");
  const [formRole, setFormRole] = useState<"admin_l1" | "admin_l2" | "pimpinan">(
    () => editingUser?.role || "admin_l2"
  );
  const [formTeamId, setFormTeamId] = useState(
    () => editingUser?.team_id || teams[0]?.id || ""
  );
  const [formPassword, setFormPassword] = useState("");
  const [formIsActive, setFormIsActive] = useState(
    () => (editingUser ? editingUser.is_active : true)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = [
    { value: "admin_l2", label: "Petugas Unit (Unit Pelaksana)" },
    { value: "admin_l1", label: "Admin (Front-Office & Disposisi)" },
    { value: "pimpinan", label: "Pimpinan" },
  ];

  const teamOptions = [
    { value: "", label: "-- Pilih Tim Penanganan --" },
    ...teams.map((t) => ({ value: t.id, label: t.name })),
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formFullName.trim()) {
      showToast("Nama lengkap wajib diisi.", "warning");
      return;
    }

    if (formPhone && formPhone.length < 9) {
      showToast("Nomor WhatsApp minimal 9 digit angka.", "warning");
      return;
    }

    if (formRole === "admin_l2" && !formTeamId) {
      showToast("Petugas Unit wajib memilih Tim Penanganan.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        const payload: Record<string, unknown> = {
          full_name: formFullName.trim(),
          phone_number: formPhone.trim() || null,
          role: formRole,
          team_id: formRole === "admin_l2" ? formTeamId : null,
          is_active: formIsActive,
        };
        if (formPassword) {
          payload.reset_password = formPassword;
        }

        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || "Gagal memperbarui user", "error");
          return;
        }
        showToast("Data petugas berhasil diperbarui.", "success");
      } else {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formEmail.trim(),
            full_name: formFullName.trim(),
            phone_number: formPhone.trim() || null,
            role: formRole,
            team_id: formRole === "admin_l2" ? formTeamId : null,
            password: formPassword || "Admin123",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || "Gagal membuat user baru", "error");
          return;
        }
        showToast("Akun petugas berhasil dibuat.", "success");
      }

      onSuccess();
      onClose();
    } catch {
      showToast("Gangguan koneksi", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-backdrop-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-xl border border-[#d1ded0] space-y-5 animate-dialog-in max-h-[90vh] overflow-y-auto">
        <div className="border-b border-[#e2e8f0] pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
            PENGATURAN AKUN PETUGAS
          </span>
          <h2 className="text-lg font-bold text-[#191c19] mt-0.5">
            {editingUser ? "Edit Data Petugas" : "Tambah Akun Petugas Baru"}
          </h2>
          <p className="mt-1 text-xs text-[#475447]">
            Konfigurasikan peran, hak akses antrean, dan data diri petugas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!editingUser && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#191c19] mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="nama@email.com"
                className="block w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#191c19] mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
              placeholder="Nama Lengkap"
              className="block w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#191c19] mb-1.5">
              Nomor WhatsApp
            </label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="081234567890"
              className="block w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 font-mono tabular-nums text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#191c19] mb-1.5">
              Peran Pengguna (Role)
            </label>
            <CustomSelect
              value={formRole}
              onChange={(val) =>
                setFormRole(val as "admin_l1" | "admin_l2" | "pimpinan")
              }
              options={roleOptions}
            />
          </div>

          {formRole === "admin_l2" && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#191c19] mb-1.5">
                Tim Penanganan Tujuan Disposisi
              </label>
              <CustomSelect
                value={formTeamId}
                onChange={(val) => setFormTeamId(String(val))}
                options={teamOptions}
                placeholder="-- Pilih Tim Penanganan --"
              />
              <p className="mt-1 text-[11px] text-[#475447]">
                Petugas Unit hanya akan dapat mengakses antrean tiket yang didisposisikan ke tim ini.
              </p>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#191c19] mb-1.5">
              {editingUser ? "Reset Password (Kosongkan jika tidak diubah)" : "Password Awal"}
            </label>
            <input
              type="text"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder={editingUser ? "Masukkan password baru" : "Default: Admin123"}
              className="block w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
            />
          </div>

          {editingUser && (
            <div className="flex items-center gap-2 pt-1">
              <input
                id="is_active_check"
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-[#d1ded0] text-[#1e4f28] focus:ring-[#1e4f28]"
              />
              <label htmlFor="is_active_check" className="text-xs font-semibold text-[#191c19] cursor-pointer">
                Akun Aktif (Dapat Login)
              </label>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex h-11 min-h-[44px] items-center justify-center rounded-lg border border-[#d1ded0] px-4 text-xs sm:text-sm font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-[#1e4f28] px-5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Menyimpan..." : editingUser ? "Simpan Perubahan" : "Buat Akun"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
