import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Disclaimer } from "@/components/disclaimer";
import {
  Activity,
  MapPin,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B5FA5] text-white">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            JetHealth
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className={cn(buttonVariants({ variant: "ghost" }))}>
            Accedi
          </Link>
          <Link
            href="/auth/register"
            className={cn(buttonVariants(), "bg-[#0B5FA5] hover:bg-[#094d87]")}
          >
            Registrati
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="py-16 text-center md:py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#0B5FA5]">
            Orientamento sanitario per il Lazio
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
            Capisci dove andare, prima di andare in pronto soccorso.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            JetHealth analizza i tuoi sintomi in modo prudente, ti indica il
            livello di urgenza e ti aiuta a trovare la struttura sanitaria più
            adatta nel Lazio.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-14 w-full bg-[#0B5FA5] px-8 text-base hover:bg-[#094d87] sm:w-auto",
              )}
            >
              Inizia ora <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
            <Link
              href="/auth/login"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-14 w-full px-8 text-base sm:w-auto",
              )}
            >
              Ho già un account
            </Link>
          </div>
        </section>

        <section className="grid gap-6 pb-16 md:grid-cols-3">
          {[
            {
              icon: Stethoscope,
              title: "Triage prudente",
              text: "Classificazione dell'urgenza in 4 livelli con linguaggio chiaro ed empatico. Nel dubbio, scegliamo sempre l'opzione più sicura.",
            },
            {
              icon: MapPin,
              title: "Strutture vicine",
              text: "Trova pronto soccorso, ambulatori e farmacie nel Lazio, ordinati per distanza e adeguatezza clinica.",
            },
            {
              icon: ShieldCheck,
              title: "Privacy by design",
              text: "I tuoi dati sanitari vengono salvati solo con il tuo consenso e puoi cancellarli in qualsiasi momento.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0B5FA5]">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {f.text}
              </p>
            </div>
          ))}
        </section>

        <section className="pb-20">
          <Disclaimer />
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6">
        <p className="text-center text-xs text-slate-500">
          JetHealth — Sistema di orientamento sanitario digitale. Non sostituisce
          il parere di un medico.
        </p>
      </footer>
    </div>
  );
}
