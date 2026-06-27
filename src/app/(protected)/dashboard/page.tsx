import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("jh_profiles")
    .select("name")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Ciao{profile?.name ? `, ${profile.name}` : ""} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Come posso aiutarti oggi?
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/triage"
          className="flex items-center gap-4 p-5 rounded-2xl bg-[#0B5FA5] text-white shadow-lg shadow-[#0B5FA5]/20 hover:bg-[#094d87] transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="12" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-lg">Analizza i miei sintomi</div>
            <div className="text-sm text-white/70">Ricevi un orientamento sanitario</div>
          </div>
        </Link>

        <Link
          href="/facilities"
          className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#0B5FA5]/30 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-[#EAF2FB] flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" stroke="#0B5FA5" strokeWidth="1.7" />
              <circle cx="12" cy="10" r="2.2" stroke="#0B5FA5" strokeWidth="1.7" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-gray-900">Trova struttura vicina</div>
            <div className="text-sm text-gray-500">Mappa delle strutture sanitarie</div>
          </div>
        </Link>

        <Link
          href="/history"
          className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#0B5FA5]/30 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-[#EAF2FB] flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#0B5FA5" strokeWidth="1.7" />
              <path d="M12 7v5l3 2" stroke="#0B5FA5" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-gray-900">I miei triage</div>
            <div className="text-sm text-gray-500">Storico delle analisi passate</div>
          </div>
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 flex gap-3 items-start bg-orange-50 border border-orange-200 rounded-xl p-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
          <path d="M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" stroke="#d97706" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-xs text-orange-800 leading-relaxed">
          JetHealth non sostituisce il parere di un medico. In caso di emergenza o
          peggioramento rapido, chiama subito il 112/118.
        </p>
      </div>
    </div>
  );
}
