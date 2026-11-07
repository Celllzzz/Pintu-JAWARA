import React from "react";
import { TicketDetailResult } from "@/lib/services/ticket";

interface TicketAuditListProps {
  auditLogs: TicketDetailResult["audit_logs"];
}

export function TicketAuditList({ auditLogs }: TicketAuditListProps) {
  if (!auditLogs || auditLogs.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#d1ded0] bg-white p-6 sm:p-8 shadow-none space-y-4">
      <span className="text-xs font-bold uppercase tracking-wider text-[#52792b]">
        REKAM JEJAK SISTEM
      </span>
      <h3 className="text-base font-bold text-[#191c19]">
        Log Transparansi Penanganan
      </h3>

      <div className="divide-y divide-[#e2e8f0] border-t border-[#e2e8f0] text-xs">
        {auditLogs.map((log) => (
          <div
            key={log.id}
            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
          >
            <div>
              <p className="font-bold text-[#191c19]">
                {log.notes || `Aksi: ${log.action}`}
              </p>
              <p className="text-[11px] text-[#475447]">
                Oleh: {log.actor_name || log.actor_type}
              </p>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-[#475447] shrink-0">
              {new Date(log.created_at).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
