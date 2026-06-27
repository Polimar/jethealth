"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Activity,
  Home,
  Stethoscope,
  MapPin,
  History,
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/triage", label: "Triage", icon: Stethoscope },
  { href: "/facilities", label: "Strutture", icon: MapPin },
  { href: "/history", label: "Cronologia", icon: History },
  { href: "/profile", label: "Profilo", icon: User },
];

export function AppNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B5FA5] text-white">
            <Activity className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold text-slate-900">JetHealth</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {LINKS.map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-blue-50 text-[#0B5FA5]"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>
        <Button variant="ghost" className="justify-start gap-3" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-slate-200 bg-white py-2 md:hidden">
        {LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 text-[10px] font-medium",
                active ? "text-[#0B5FA5]" : "text-slate-500",
              )}
            >
              <l.icon className="h-5 w-5" />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
