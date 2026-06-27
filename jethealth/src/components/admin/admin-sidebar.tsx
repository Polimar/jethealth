"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Users,
  Activity,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/settings", label: "Impostazioni", icon: Settings },
  { href: "/admin/users", label: "Utenti", icon: Users },
  { href: "/admin/api-monitor", label: "Monitor API", icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 flex w-56 flex-col border-r border-slate-800 bg-slate-900 p-4 text-slate-200">
      <div className="mb-6 px-2">
        <span className="text-lg font-bold text-white">JetHealth</span>
        <p className="text-xs text-slate-400">Pannello admin</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active ? "bg-[#0B5FA5] text-white" : "text-slate-300 hover:bg-slate-800",
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> App utente
      </Link>
      <Button variant="ghost" className="justify-start gap-3 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={logout}>
        <LogOut className="h-4 w-4" /> Esci
      </Button>
    </aside>
  );
}
