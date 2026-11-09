import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ProfileFormView } from "@/components/admin/ProfileFormView";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <ProfileFormView initialUser={user} />;
}
