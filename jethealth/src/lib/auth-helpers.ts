import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  name: string | null;
  role: "user" | "admin";
  consent_data_storage: boolean;
  disabled: boolean;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, name, role, consent_data_storage, disabled")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
}

export async function requireAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}
