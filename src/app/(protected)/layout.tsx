import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("jh_profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0B5FA5] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="M12 3v18M3 12h18" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-bold text-sm text-gray-900">JetHealth</span>
          </Link>
          <div className="flex items-center gap-4">
            {profile?.role === "admin" && (
              <Link href="/admin/dashboard" className="text-xs font-medium text-[#0B5FA5] bg-[#EAF2FB] px-3 py-1.5 rounded-lg">
                Admin
              </Link>
            )}
            <Link href="/history" className="text-sm text-gray-600 hover:text-gray-900">
              Storico
            </Link>
            <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900">
              {profile?.name || user.email?.split("@")[0]}
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
