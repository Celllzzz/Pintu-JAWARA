import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { UsersManagementClient } from "@/components/admin/UsersManagementClient";
import { UserItem, TeamItem } from "@/components/admin/UserFormModal";

export default async function UsersManagementPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin_l1") {
    redirect(user ? "/admin/tickets" : "/login");
  }

  const supabase = createAdminClient();

  const [usersRes, teamsRes] = await Promise.all([
    supabase
      .from("users")
      .select(`
        id,
        email,
        full_name,
        phone_number,
        role,
        team_id,
        is_active,
        created_at,
        teams (
          id,
          name,
          code
        )
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),

    supabase
      .from("teams")
      .select("id, code, name")
      .is("deleted_at", null)
      .order("name", { ascending: true }),
  ]);

  const initialUsers = (usersRes.data || []) as unknown as UserItem[];
  const initialTeams = (teamsRes.data || []) as unknown as TeamItem[];

  return (
    <UsersManagementClient
      initialUsers={initialUsers}
      initialTeams={initialTeams}
    />
  );
}
