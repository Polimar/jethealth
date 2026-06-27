import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C5399] to-[#083D74]">
      <div className="mx-auto max-w-lg px-5 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M12 3v18M3 12h18" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">JetHealth</span>
        </div>

        {/* Hero */}
        <div className="text-white mb-10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/55 font-semibold">
            Orientamento sanitario · Regione Lazio
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-balance">
            Capisci dove andare, prima di andare in pronto soccorso.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/70 font-serif">
            Descrivi i sintomi: JetHealth valuta l&apos;urgenza e ti indica il percorso più adatto,
            dal medico di base al pronto soccorso.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 mb-10">
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-white text-[#0B5FA5] text-base font-semibold shadow-lg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="12" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            Accedi e analizza i sintomi
          </Link>
          <Link
            href="/auth/register"
            className="flex items-center justify-center gap-3 w-full h-12 rounded-2xl border border-white/30 text-white text-sm font-medium"
          >
            Registrati
          </Link>
        </div>

        {/* How it works */}
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/50 font-semibold mb-4">
            Come funziona
          </p>
          {[
            { n: 1, title: "Descrivi i sintomi", body: "A parole tue o con esempi guidati" },
            { n: 2, title: "Controllo di sicurezza", body: "Verifichiamo i segnali da non ignorare" },
            { n: 3, title: "Ricevi l'orientamento", body: "Livello di urgenza e percorso consigliato" },
          ].map((step) => (
            <div key={step.n} className="flex gap-4 items-start py-3 border-b border-white/10">
              <div className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center font-semibold text-sm">
                {step.n}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{step.title}</div>
                <div className="text-xs text-white/60 mt-0.5">{step.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="flex gap-3 items-start bg-red-500/10 border border-red-400/30 rounded-xl p-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
            <path d="M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" stroke="#fca5a5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-xs text-red-200/80 leading-relaxed">
            JetHealth non sostituisce il parere di un medico. In caso di emergenza o peggioramento rapido,
            chiama subito il 112/118.
          </p>
        </div>
      </div>
    </div>
  );
}
