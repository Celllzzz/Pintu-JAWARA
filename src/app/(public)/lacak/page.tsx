"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HardDriveDownload } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { TicketTimeline } from "@/components/public/TicketTimeline";
import { RevisionUpload } from "@/components/public/RevisionUpload";
import { BillingUpload } from "@/components/public/BillingUpload";
import { TicketInfoCard } from "@/components/public/TicketInfoCard";
import { TicketResultCard } from "@/components/public/TicketResultCard";
import { TicketAuditList } from "@/components/public/TicketAuditList";
import { TicketDetailResult } from "@/lib/services/ticket";
import { saveOfflineTicket, getOfflineTicket } from "@/lib/pwa/offline-storage";

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialTicket = searchParams.get("ticket") || "";
  const initialPin = searchParams.get("pin") || "";

  const { showToast } = useToast();

  const [ticketNumber, setTicketNumber] = useState(initialTicket);
  const [pinLast4, setPinLast4] = useState(initialPin);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<TicketDetailResult | null>(null);
  const [isFromOfflineCache, setIsFromOfflineCache] = useState(false);

  const fetchTracking = useCallback(
    async (tNumber: string, pin: string) => {
      const cleanNum = tNumber.trim().toUpperCase();
      const cleanPin = pin.trim();
      if (!cleanNum || !cleanPin) return;

      setIsLoading(true);
      setErrorMessage(null);

      // 1. If currently offline, attempt loading from offline storage immediately
      if (!navigator.onLine) {
        const cached = getOfflineTicket(cleanNum, cleanPin);
        if (cached) {
          setTicketData(cached.ticket);
          setIsFromOfflineCache(true);
          showToast("Mode Offline: Menampilkan data tiket yang tersimpan di perangkat.", "info");
          setIsLoading(false);
          return;
        } else {
          setErrorMessage("Mode Offline: Tiket ini belum pernah dibuka pada perangkat ini saat online.");
          setTicketData(null);
          setIsLoading(false);
          return;
        }
      }

      // 2. Online request
      try {
        const res = await fetch("/api/tickets/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket_number: cleanNum,
            pin_last4: cleanPin,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          // If server returned 404/401, check offline cache as fallback
          const cached = getOfflineTicket(cleanNum, cleanPin);
          if (cached) {
            setTicketData(cached.ticket);
            setIsFromOfflineCache(true);
            showToast("Menampilkan data salinan terakhir di perangkat.", "info");
            return;
          }

          setErrorMessage(data.error || "Data permohonan tidak ditemukan.");
          setTicketData(null);
          showToast(data.error || "Verifikasi tiket gagal", "error");
          return;
        }

        setTicketData(data.ticket);
        setIsFromOfflineCache(false);
        saveOfflineTicket(data.ticket, cleanPin);
        showToast("Data permohonan berhasil dimuat.", "success");
      } catch {
        // Network failure fallback
        const cached = getOfflineTicket(cleanNum, cleanPin);
        if (cached) {
          setTicketData(cached.ticket);
          setIsFromOfflineCache(true);
          showToast("Koneksi gagal. Menampilkan data dari penyimpanan offline.", "info");
        } else {
          setErrorMessage("Gagal terhubung ke server dan tidak ada salinan offline tersimpan.");
          showToast("Gangguan koneksi jaringan", "error");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      if (!initialTicket.trim() || !initialPin.trim()) return;
      if (!ignore) {
        fetchTracking(initialTicket, initialPin);
      }
    }

    loadInitial();
    return () => {
      ignore = true;
    };
  }, [initialTicket, initialPin, fetchTracking]);

  // Revalidate automatically when coming back online
  useEffect(() => {
    function handleReconnect() {
      if (isFromOfflineCache && ticketNumber && pinLast4) {
        fetchTracking(ticketNumber, pinLast4);
      }
    }
    window.addEventListener("online", handleReconnect);
    return () => window.removeEventListener("online", handleReconnect);
  }, [isFromOfflineCache, ticketNumber, pinLast4, fetchTracking]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchTracking(ticketNumber, pinLast4);
  }

  return (
    <div className="space-y-8">
      {/* 1. Track Form Header */}
      <section className="rounded-2xl border border-[#d1ded0] bg-white p-6 sm:p-8 shadow-none">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#52792b]">
            PELACAKAN LAYANAN PUBLIK
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191c19]">
            Lacak Status Permohonan
          </h1>
          <p className="text-xs sm:text-sm text-[#475447] leading-relaxed">
            Masukkan Nomor E-Tiket dan 4 digit terakhir nomor yang digunakan saat pengajuan permohonan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <label htmlFor="t_number" className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5 whitespace-nowrap">
              Nomor E-Tiket
            </label>
            <input
              id="t_number"
              type="text"
              required
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
              placeholder="SL-BS-948231"
              className="w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 text-sm font-mono tabular-nums text-[#191c19] placeholder:font-sans placeholder:text-[#475447]/60 focus:border-[#1e4f28] focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-72">
            <label htmlFor="t_pin" className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5 whitespace-nowrap">
              4 Digit Terakhir No. Pengajuan
            </label>
            <input
              id="t_pin"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={4}
              required
              value={pinLast4}
              onChange={(e) => setPinLast4(e.target.value.replace(/\D/g, ""))}
              placeholder="4567"
              className="w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 text-sm font-mono tabular-nums text-[#191c19] placeholder:font-sans placeholder:text-[#475447]/60 focus:border-[#1e4f28] focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-auto shrink-0">
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-11 min-h-[44px] w-full sm:w-auto items-center justify-center rounded-lg bg-[#1e4f28] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-50 transition-colors"
            >
              <span>{isLoading ? "Memeriksa..." : "Lacak Tiket"}</span>
            </button>
          </div>
        </form>

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3.5 text-xs font-semibold text-[#991b1b]"
          >
            {errorMessage}
          </div>
        )}
      </section>

      {/* Offline Indicator Alert if loaded from cache */}
      {isFromOfflineCache && (
        <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4 text-xs text-[#92400e] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HardDriveDownload className="h-4 w-4 text-[#d97706] shrink-0" />
            <span>
              <strong>Salinan Offline:</strong> Menampilkan data tiket yang tersimpan di perangkat Anda. Pembaruan otomatis akan berjalan saat internet terhubung kembali.
            </span>
          </div>
        </div>
      )}

      {/* 2. Tracking Details View */}
      {ticketData && (
        <div className="space-y-6">
          <TicketInfoCard ticketData={ticketData} />

          <TicketTimeline
            status={ticketData.status}
            surveyFilled={ticketData.survey_filled}
          />

          {ticketData.status === "perlu_perbaikan" && (
            <RevisionUpload
              ticketId={ticketData.id}
              notesFromOfficer={ticketData.completion_note}
              onSuccess={() => fetchTracking(ticketNumber, pinLast4)}
            />
          )}

          {ticketData.billing && (
            <BillingUpload
              ticketId={ticketData.id}
              billing={ticketData.billing}
              onSuccess={() => fetchTracking(ticketNumber, pinLast4)}
            />
          )}

          <TicketResultCard ticketData={ticketData} />

          <TicketAuditList auditLogs={ticketData.audit_logs} />
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      <Suspense
        fallback={
          <div className="rounded-2xl border border-[#d1ded0] bg-white p-8 text-center text-sm text-[#475447]">
            Memuat modul pelacakan...
          </div>
        }
      >
        <TrackingContent />
      </Suspense>
    </main>
  );
}
