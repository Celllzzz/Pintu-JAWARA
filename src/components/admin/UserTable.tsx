"use client";

import React from "react";
import { UserItem } from "./UserFormModal";
import { DataTable, Column } from "@/components/ui/DataTable";

interface UserTableProps {
  users: UserItem[];
  isLoading: boolean;
  onEdit: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
}

export function UserTable({
  users,
  isLoading,
  onEdit,
  onDelete,
}: UserTableProps) {
  const roleBadgeStyle = (role: string) => {
    switch (role) {
      case "admin_l1":
        return "bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]";
      case "admin_l2":
        return "bg-[#f0fdf4] text-[#1e4f28] border-[#bbf7d0]";
      case "pimpinan":
        return "bg-[#fffbeb] text-[#92400e] border-[#fde68a]";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const roleText = (role: string) => {
    switch (role) {
      case "admin_l1":
        return "Admin";
      case "admin_l2":
        return "Petugas Unit";
      case "pimpinan":
        return "Pimpinan";
      default:
        return role;
    }
  };

  const columns: Column<UserItem>[] = [
    {
      key: "full_name",
      header: "Nama & Email",
      render: (u) => (
        <div>
          <p className="font-bold text-[#191c19]">{u.full_name}</p>
          <p className="text-xs text-[#475447]">{u.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Peran",
      render: (u) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleBadgeStyle(
            u.role
          )}`}
        >
          {roleText(u.role)}
        </span>
      ),
    },
    {
      key: "team_id",
      header: "Tim Penanganan",
      render: (u) => u.teams?.name || "—",
    },
    {
      key: "phone_number",
      header: "Kontak WA",
      align: "center",
      render: (u) => (
        <span className="font-mono tabular-nums text-[#475447]">
          {u.phone_number || "—"}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (u) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            u.is_active
              ? "bg-[#ecfdf5] text-[#065f46]"
              : "bg-[#fef2f2] text-[#991b1b]"
          }`}
        >
          {u.is_active ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(u)}
            className="h-8 min-h-[32px] px-3 rounded-lg border border-[#d1ded0] bg-white text-xs font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(u)}
            className="h-8 min-h-[32px] px-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] text-xs font-semibold text-[#991b1b] hover:bg-[#fee2e2] transition-colors"
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      title="Daftar Petugas Aktif"
      totalLabel={
        <span>
          Total terdaftar:{" "}
          <strong className="font-mono tabular-nums text-[#191c19]">
            {users.length}
          </strong>
        </span>
      }
      data={users}
      columns={columns}
      keyExtractor={(u) => u.id}
      isLoading={isLoading}
      searchPlaceholder="Cari nama, email, tim petugas..."
      emptyMessage="Belum ada data petugas terdaftar."
      renderMobileCard={(u, idx) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
            <span className="text-[10px] font-bold text-[#52792b] uppercase">
              No. #{idx + 1}
            </span>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${roleBadgeStyle(
                u.role
              )}`}
            >
              {roleText(u.role)}
            </span>
          </div>
          <div>
            <p className="font-bold text-[#191c19]">{u.full_name}</p>
            <p className="text-xs text-[#475447]">{u.email}</p>
          </div>
          {u.teams?.name && (
            <p className="text-xs text-[#1e4f28] font-medium">Unit: {u.teams.name}</p>
          )}
          <div className="flex items-center justify-between text-xs text-[#475447]">
            <span>WA: {u.phone_number || "—"}</span>
            <span
              className={`font-semibold ${
                u.is_active ? "text-[#065f46]" : "text-[#991b1b]"
              }`}
            >
              {u.is_active ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onEdit(u)}
              className="flex-1 h-9 rounded-lg border border-[#d1ded0] text-xs font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(u)}
              className="flex-1 h-9 rounded-lg border border-[#fecaca] bg-[#fef2f2] text-xs font-semibold text-[#991b1b] hover:bg-[#fee2e2] transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      )}
    />
  );
}
