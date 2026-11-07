"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface TeamItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

interface AdminDisposeActionProps {
  ticketId: string;
  currentTeamId?: string | null;
  teams: TeamItem[];
  onSuccess: () => void;
  onCancel?: () => void;
  isChanging?: boolean;
}

export function AdminDisposeAction({
  ticketId,
  currentTeamId,
  teams,
  onSuccess,
  onCancel,
  isChanging = false,
}: AdminDisposeActionProps) {
  const { showToast } = useToast();
  const [selectedTeamId, setSelectedTeamId] = useState(currentTeamId || "");
  const [isDisposing, setIsDisposing] = useState(false);

  async function handleDispose(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTeamId) {
      showToast("Pilih salah satu Tim Penanganan.", "warning");
      return;
    }

    setIsDisposing(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/dispose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: selectedTeamId }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal mendisposisikan tiket.", "error");
        return;
      }

      showToast(data.message || "Tiket berhasil didisposisikan.", "success");
      onSuccess();
    } catch {
      showToast("Gangguan koneksi.", "error");
    } finally {
      setIsDisposing(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#d1ded0] bg-white p-5 space-y-4 shadow-none">
      <div className="border-b border-[#e2e8f0] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
          DISPOSISI LAYANAN (ADMIN)
        </span>
        <h4 className="text-sm font-bold text-[#191c19]">
          Teruskan ke Tim Penanganan Unit Pelaksana
        </h4>
      </div>

      <p className="text-xs text-[#475447] leading-relaxed">
        Pilih tepat satu unit penanganan yang berwenang menindaklanjuti permohonan ini. Tiket akan langsung diteruskan ke antrean khusus petugas unit tersebut.
      </p>

      <form onSubmit={handleDispose} className="space-y-3">
        <div>
          <label
            htmlFor="dispose_team_select"
            className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
          >
            Pilih 1 dari 8 Tim Penanganan
          </label>
          <div className="relative">
            <select
              id="dispose_team_select"
              required
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="block w-full appearance-none h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white pl-3.5 pr-12 text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none cursor-pointer"
            >
              <option value="">-- Pilih Tim Penanganan Tujuan Disposisi --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-[#475447] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
          {isChanging && onCancel && (
            <button
              type="button"
              disabled={isDisposing}
              onClick={onCancel}
              className="h-11 min-h-[44px] px-4 rounded-lg border border-[#d1ded0] text-xs sm:text-sm font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={isDisposing || !selectedTeamId}
            className="flex-1 h-11 min-h-[44px] flex items-center justify-center rounded-lg bg-[#1e4f28] px-5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-50 transition-colors"
          >
            <span>
              {isDisposing
                ? "Menyimpan..."
                : isChanging
                ? "Simpan Perubahan Disposisi"
                : "Teruskan Disposisi ke Tim"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
