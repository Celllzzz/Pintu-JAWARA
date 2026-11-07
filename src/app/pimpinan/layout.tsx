import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function PimpinanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
