"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useToast } from "@/components/ui/Toast";
import { AdminTicketQueue, TicketQueueItem } from "./AdminTicketQueue";
import { AdminTicketDetail, FullTicketData } from "./AdminTicketDetail";

interface AdminTicketsWorkspaceProps {
  initialTickets: FullTicketData[];
  teams: Array<{ id: string; code: string; name: string; description: string | null }>;
}

export function AdminTicketsWorkspace({
  initialTickets,
  teams,
}: AdminTicketsWorkspaceProps) {
  const { showToast } = useToast();

  const [tickets, setTickets] = useState<FullTicketData[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    initialTickets[0]?.id || null
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mobileView, setMobileView] = useState<"queue" | "detail">("queue");
  const isFirstMount = useRef(true);

  const refreshTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/admin/tickets?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
      }
    } catch {
      showToast("Gagal memuat ulang antrean tiket.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, showToast]);

  // Refetch only when statusFilter or searchQuery changes after initial mount
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    let ignore = false;
    async function load() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (searchQuery.trim()) params.set("q", searchQuery.trim());

        const res = await fetch(`/api/admin/tickets?${params.toString()}`);
        const data = await res.json();
        if (!ignore && res.ok) {
          setTickets(data.tickets || []);
        }
      } catch {
        if (!ignore) showToast("Gagal memuat ulang antrean tiket.", "error");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [statusFilter, searchQuery, showToast]);

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId) || null,
    [tickets, selectedTicketId]
  );

  function handleSelectTicket(id: string) {
    setSelectedTicketId(id);
    setMobileView("detail");
  }

  return (
    <div className="space-y-4">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e2e8f0] pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
            WORKSPACE PELAYANAN TERPADU
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#191c19]">
            Antrean Tiket Permohonan
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#475447]">
            Total Tiket: <strong className="font-mono tabular-nums text-[#191c19]">{tickets.length}</strong>
          </span>
          <button
            type="button"
            onClick={refreshTickets}
            className="h-9 min-h-[36px] px-3 rounded-lg border border-[#d1ded0] bg-white text-xs font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
          >
            Segarkan
          </button>
        </div>
      </div>

      {/* Master-Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Queue (Desktop always visible; Mobile conditional) */}
        <div
          className={`lg:col-span-5 ${
            mobileView === "detail" ? "hidden lg:block" : "block"
          }`}
        >
          <AdminTicketQueue
            tickets={tickets as TicketQueueItem[]}
            selectedTicketId={selectedTicketId}
            onSelectTicket={handleSelectTicket}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Detail & Actions (Desktop always visible; Mobile conditional) */}
        <div
          className={`lg:col-span-7 ${
            mobileView === "queue" ? "hidden lg:block" : "block"
          }`}
        >
          <AdminTicketDetail
            ticket={selectedTicket}
            teams={teams}
            onSuccess={refreshTickets}
            onBackMobile={() => setMobileView("queue")}
          />
        </div>
      </div>
    </div>
  );
}
