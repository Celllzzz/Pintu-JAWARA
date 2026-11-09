import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CachedServiceCategory {
  id: string;
  code: string;
  name: string;
  sla_days: number;
  is_commercial: boolean;
}

export interface CachedSubService {
  id: string;
  category_id: string;
  name: string;
}

export const getCachedServiceCategories = unstable_cache(
  async (): Promise<CachedServiceCategory[]> => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("service_categories")
      .select("id, code, name, sla_days, is_commercial")
      .is("deleted_at", null)
      .order("code", { ascending: true });
    return (data || []) as CachedServiceCategory[];
  },
  ["service_categories_list"],
  { revalidate: 3600 }
);

export const getCachedSubServices = unstable_cache(
  async (): Promise<CachedSubService[]> => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("sub_services")
      .select("id, category_id, name")
      .is("deleted_at", null)
      .order("name", { ascending: true });
    return (data || []) as CachedSubService[];
  },
  ["sub_services_list"],
  { revalidate: 3600 }
);
