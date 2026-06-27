"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { URGENCY_LEVELS } from "@/lib/triage-schema";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isEmergency = searchParams.get("emergency") === "true";
  const resultRaw = searchParams.get("result");
  const flagsRaw = searchParams.get("flags");

  if (isEmergency) {
    const flags = flagsRaw ? JSON.parse(decodeURIComponent(flagsRaw)) : [];
    return <EmergencyView flags={flags} />;
  }

  if (!resultRaw) {
    router.push("/triage");
    return null;
  }

  const result = JSON.parse(resultRaw);
  const level = URGENCY_LEVELS[result.urgencyLevel as keyof typeof URGENCY_LEVELS] || URGENCY_LEVELS.medium;

  const alternatives = result.urgencyLevel === "low" || result.urgencyLevel === "medium" ? [
    { icon: "🩺", title: "Medico di base", body: "Per valutazione e prescrizioni" },
    { icon: "☎️", title: "Continuità assistenziale", body: "Guardia medica · notti e festivi · 116117" },
    { icon: "💊", title: "Farmacia", body: "Consigli su sintomi lievi" },
  ] : [];

  return (
    <div className="max-w-lg mx-auto">
      {/* Urgency banner */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: level.color }}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              <UrgencyIcon level={result.urgencyLevel} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest font-semibold opacity-70">Livello di urgenza</div>
              <div className="text-xl font-bold tracking-tight mt-0.5">{level.label}</div>
            </div>
          </div>
          <div className="text-xs font-medium bg-white/20 px-3 py-1.5 rounded-full">
            Affidabilità {result.confidence}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <Card className="p-4 mb-3">
        <p className="text-base leading-relaxed text-gray-800 font-serif">{result.explanation}</p>
      </Card>

      {/* Recommended action */}
      <div className="rounded-xl p-4 mb-3 border" style={{ background: level.bgColor, borderColor: level.color + "33" }}>
        <div className="text-[11px] uppercase tracking-wider font-bold mb-1" style={{ color: level.color }}>
          Azione consigliata
        </div>
        <div className="text-base font-bold text-gray-900">{result.actionLabel}</div>
      </div>

      {/* Next steps */}
      {result.nextSteps?.length > 0 && (
        <Card className="p-4 mb-3">
          <div className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#0B5FA5" strokeWidth="1.7" />
              <path d="M12 7v5l3 2" stroke="#0B5FA5" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Cosa fare ora
          </div>
          <div className="flex flex-col gap-2.5">
            {result.nextSteps.map((step: string, i: number) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-md bg-[#EAF2FB] text-[#0B5FA5] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <Card className="p-4 mb-3">
          <div className="text-sm font-bold text-gray-900 mb-1">Alternative al pronto soccorso</div>
          <div className="text-xs text-gray-500 mb-3">Percorsi più adatti a questa urgenza</div>
          <div className="flex flex-col gap-2">
            {alternatives.map((alt) => (
              <div key={alt.title} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                <span className="text-lg">{alt.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{alt.title}</div>
                  <div className="text-xs text-gray-500">{alt.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Watch for */}
      {result.watchFor?.length > 0 && (
        <div className="rounded-xl p-4 mb-4 bg-amber-50 border border-amber-200">
          <div className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" stroke="#b45309" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Quando preoccuparsi
          </div>
          <p className="text-xs text-amber-700 mb-2">
            Chiama subito il <strong>112/118</strong> o vai in pronto soccorso se compare:
          </p>
          <div className="flex flex-col gap-1.5">
            {result.watchFor.map((w: string, i: number) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-red-600 font-bold mt-0.5">•</span>
                <span className="text-xs text-amber-900">{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {result.facilitySearchRequired && (
        <Link href="/facilities">
          <Button className="w-full h-12 rounded-xl bg-[#0B5FA5] hover:bg-[#094d87] text-white font-bold mb-3 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" stroke="#fff" strokeWidth="1.7" />
              <circle cx="12" cy="10" r="2.4" stroke="#fff" strokeWidth="1.7" />
            </svg>
            Trova la struttura più adatta
          </Button>
        </Link>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-11 rounded-xl"
          onClick={() => router.push("/triage")}
        >
          Nuova analisi
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-11 rounded-xl"
          onClick={() => router.push("/history")}
        >
          I miei triage
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 flex gap-2 items-start text-xs text-gray-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 11v5m0-8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        JetHealth non sostituisce il parere di un medico. In caso di emergenza chiama il 112/118.
      </div>
    </div>
  );
}

function EmergencyView({ flags }: { flags: string[] }) {
  return (
    <div className="max-w-lg mx-auto -mt-6 -mx-4">
      <div className="bg-[#C8312B] text-white px-5 py-8 rounded-b-3xl">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-red-200">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          Possibile emergenza
        </div>
        <h1 className="mt-4 text-2xl font-bold">Chiama subito il 112/118</h1>
        <p className="mt-3 text-sm text-red-100 leading-relaxed font-serif">
          I segnali indicati possono richiedere assistenza immediata.
          Non guidare da solo se hai sintomi gravi.
        </p>

        {flags.length > 0 && (
          <div className="mt-4 text-sm text-red-100">
            <div className="font-semibold mb-1">Segnali rilevati:</div>
            {flags.map((f: string) => (
              <div key={f} className="flex items-center gap-2">• {f}</div>
            ))}
          </div>
        )}

        <a
          href="tel:112"
          className="mt-5 flex items-center justify-center gap-3 w-full h-16 bg-white rounded-2xl text-[#C8312B] text-xl font-bold shadow-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#C8312B">
            <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
          </svg>
          Chiama 112
        </a>
      </div>

      <div className="px-5 py-6">
        <div className="text-sm font-bold text-gray-900 mb-3">Mentre aspetti i soccorsi</div>
        <div className="flex flex-col gap-3">
          {[
            "Resta seduto o sdraiato in un luogo sicuro.",
            "Se possibile, fatti assistere da qualcuno.",
            "Tieni a portata documento e tessera sanitaria.",
            "Non assumere farmaci senza indicazione medica.",
          ].map((tip) => (
            <div key={tip} className="flex gap-3 items-start">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" fill="#FBE9E7" />
                <path d="M12 8v5m0 3h.01" stroke="#C8312B" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-sm text-gray-700">{tip}</span>
            </div>
          ))}
        </div>

        <Link href="/facilities">
          <Button variant="outline" className="w-full h-12 rounded-xl mt-6">
            Trova PS più vicino
          </Button>
        </Link>
      </div>
    </div>
  );
}

function UrgencyIcon({ level }: { level: string }) {
  if (level === "low") return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (level === "medium") return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.7" /><path d="M12 8v4l2.5 2.5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" /></svg>;
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B5FA5] rounded-full animate-spin" /></div>}>
      <ResultsContent />
    </Suspense>
  );
}
