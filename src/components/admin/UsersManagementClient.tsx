"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UserFormModal, UserItem, TeamItem } from "@/components/admin/UserFormModal";
import { UserTable } from "@/components/admin/UserTable";

interface UsersManagementClientProps {
  initialUsers: UserItem[];
  initialTeams: TeamItem[];
}

export function UsersManagementClient({
  initialUsers,
  initialTeams,
}: UsersManagementClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [teams, setTeams] = useState<TeamItem[]>(initialTeams);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 403 || res.status === 401) {
        showToast("Akses ditolak: Hanya untuk Admin", "error");
        router.push("/admin/tickets");
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
      setTeams(data.teams || []);
    } catch {
      showToast("Gagal mengambil data pengguna", "error");
    } finally {
      setIsLoading(false);
    }
  }, [router, showToast]);

  function handleOpenCreate() {
    setEditingUser(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(user: UserItem) {
    setEditingUser(user);
    setIsModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal menghapus user", "error");
        return;
      }
      showToast("Akun petugas berhasil dihapus.", "success");
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      showToast("Gangguan koneksi", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#52792b]">
            MANAJEMEN PETUGAS
          </span>
          <h1 className="text-xl font-bold text-[#191c19] mt-0.5">
            Manajemen Akun Petugas
          </h1>
          <p className="text-xs text-[#475447]">
            Kelola wewenang akun Admin, Petugas Unit per tim penanganan, dan Pimpinan.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-[#1e4f28] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] self-start sm:self-auto transition-colors"
        >
          Tambah Petugas
        </button>
      </div>

      <UserTable
        users={users}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={(u) => setDeleteTarget(u)}
      />

      {/* Create / Edit Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={editingUser}
        teams={teams}
        onSuccess={fetchUsers}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Akun Petugas"
        description={`Apakah Anda yakin ingin menghapus akun ${deleteTarget?.full_name} (${deleteTarget?.email})? Sesi login akan segera dicabut.`}
        confirmText="Ya, Hapus Akun"
        cancelText="Batal"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
