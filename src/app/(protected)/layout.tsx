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
    <div className="min-h-screen bg-[#F7F9FB] pb-20 md:pb-0">
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
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/triage" className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              Triage
            </Link>
            <Link href="/facilities" className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              Strutture
            </Link>
            <Link href="/history" className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              Storico
            </Link>
            {profile?.role === "admin" && (
              <Link href="/admin/dashboard" className="text-xs font-medium text-[#0B5FA5] bg-[#EAF2FB] px-3 py-1.5 rounded-lg ml-1">
                Admin
              </Link>
            )}
          </nav>
          <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-7 h-7 rounded-full bg-[#0B5FA5] flex items-center justify-center text-white text-xs font-bold">
              {(profile?.name || user.email || "U").charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-sm text-gray-700 font-medium">
              {profile?.name || user.email?.split("@")[0]}
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#6b7280" strokeWidth="1.7" />
            </svg>
            <span className="text-[10px] text-gray-500 font-medium">Home</span>
          </Link>
          <Link href="/triage" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v3m0 12v3m9-9h-3M6 12H3" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="12" r="4" stroke="#6b7280" strokeWidth="1.7" />
            </svg>
            <span className="text-[10px] text-gray-500 font-medium">Triage</span>
          </Link>
          <Link href="/facilities" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" stroke="#6b7280" strokeWidth="1.7" />
              <circle cx="12" cy="10" r="2" stroke="#6b7280" strokeWidth="1.7" />
            </svg>
            <span className="text-[10px] text-gray-500 font-medium">Mappa</span>
          </Link>
          <Link href="/history" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#6b7280" strokeWidth="1.7" />
              <path d="M12 7v5l3 2" stroke="#6b7280" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] text-gray-500 font-medium">Storico</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="#6b7280" strokeWidth="1.7" />
              <path d="M4 21c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="#6b7280" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] text-gray-500 font-medium">Profilo</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
