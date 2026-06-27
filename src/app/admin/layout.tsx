import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("jh_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Utenti" },
    { href: "/admin/settings", label: "Impostazioni" },
    { href: "/admin/api-monitor", label: "Monitor API" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0B5FA5] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path d="M12 3v18M3 12h18" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-bold text-sm text-gray-900">JetHealth</span>
            </Link>
            <span className="text-xs font-medium text-white bg-orange-500 px-2 py-0.5 rounded">Admin</span>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/dashboard" className="ml-4 text-xs text-[#0B5FA5] font-medium">
              ← App utente
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
