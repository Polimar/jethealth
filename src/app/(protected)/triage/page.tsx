"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

type Screen = "intake" | "thinking" | "clarify" | "analyzing";
type Patient = "adulto" | "bambino" | "neonato" | "anziano";

interface ClarifyQuestion {
  id: string;
  text: string;
  hint?: string;
  multi: boolean;
  options: string[];
}

export default function TriagePage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("intake");
  const [patient, setPatient] = useState<Patient>("adulto");
  const [freeText, setFreeText] = useState("");
  const [questions, setQuestions] = useState<ClarifyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [clarifyIntro, setClarifyIntro] = useState("");
  const [error, setError] = useState("");

  const examples = [
    { icon: "🤒", text: "Ho febbre a 38,5, mal di gola e tosse da due giorni" },
    { icon: "🫁", text: "Ho dolore al petto e difficoltà a respirare" },
    { icon: "🤢", text: "Mio figlio ha vomito e diarrea da stamattina" },
  ];

  const patientOptions: { label: string; value: Patient }[] = [
    { label: "Adulto", value: "adulto" },
    { label: "Bambino", value: "bambino" },
    { label: "Neonato", value: "neonato" },
    { label: "Anziano", value: "anziano" },
  ];

  async function handleIntakeContinue() {
    if (freeText.trim().length < 10) {
      setError("Descrivi i sintomi in almeno 10 caratteri");
      return;
    }
    setError("");
    setScreen("thinking");

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clarify", symptomsText: freeText, patient }),
      });

      const data = await res.json();

      if (data.isEmergency) {
        router.push(`/results?emergency=true&flags=${encodeURIComponent(JSON.stringify(data.redFlags))}`);
        return;
      }

      setQuestions(data.questions || []);
      setClarifyIntro(data.intro || "Qualche domanda per orientarti meglio.");
      setScreen("clarify");
    } catch {
      setError("Errore di connessione. Riprova.");
      setScreen("intake");
    }
  }

  function toggleAnswer(questionId: string, option: string, multi: boolean) {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (multi) {
        return {
          ...prev,
          [questionId]: current.includes(option)
            ? current.filter((o) => o !== option)
            : [...current, option],
        };
      }
      return {
        ...prev,
        [questionId]: current.includes(option) ? [] : [option],
      };
    });
  }

  async function handleAnalyze() {
    setScreen("analyzing");

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "classify",
          symptomsText: freeText,
          patient,
          clarifyAnswers: answers,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setScreen("clarify");
        return;
      }

      const params = new URLSearchParams({ result: JSON.stringify(data) });
      router.push(`/results?${params.toString()}`);
    } catch {
      setError("Errore di connessione. Riprova.");
      setScreen("clarify");
    }
  }

  // INTAKE SCREEN
  if (screen === "intake") {
    return (
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Raccontaci cosa succede</h1>
        <p className="text-sm text-gray-500 mb-5">
          Scrivi con parole tue o scegli un esempio. Più dettagli, più l&apos;orientamento è preciso.
        </p>

        {/* Patient selector */}
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
          Chi ha i sintomi?
        </p>
        <div className="flex gap-2 mb-5">
          {patientOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPatient(opt.value)}
              className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                patient === opt.value
                  ? "border-[#0B5FA5] bg-[#0B5FA5] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Free text */}
        <Textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="Es. Ho febbre a 38,5, mal di gola e tosse da due giorni…"
          className="min-h-[110px] text-base font-serif resize-none rounded-xl border-gray-200"
        />

        {/* Quick examples */}
        <p className="mt-5 text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
          Esempi rapidi
        </p>
        <div className="flex flex-col gap-2 mb-5">
          {examples.map((ex) => (
            <button
              key={ex.text}
              onClick={() => setFreeText(ex.text)}
              className="flex items-center gap-3 text-left w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-lg">{ex.icon}</span>
              <span className="text-sm text-gray-700">{ex.text}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <Button
          onClick={handleIntakeContinue}
          className="w-full h-13 rounded-xl bg-[#0B5FA5] hover:bg-[#094d87] text-white font-bold text-base shadow-lg shadow-[#0B5FA5]/20"
        >
          Continua
        </Button>

        <p className="mt-3 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l8 4v5c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V6l8-4z" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          I sintomi vengono analizzati e salvati solo con il tuo consenso
        </p>
      </div>
    );
  }

  // THINKING SCREEN
  if (screen === "thinking") {
    return (
      <div className="max-w-lg mx-auto py-12 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full border-4 border-gray-200 border-t-[#0B5FA5] animate-spin" />
        <h2 className="mt-6 text-lg font-bold text-gray-900">Sto leggendo quello che hai scritto…</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-[280px]">
          L&apos;assistente clinico analizza la tua descrizione e prepara alcune domande mirate.
        </p>
        {freeText && (
          <div className="mt-5 max-w-[300px] bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm text-gray-600 font-serif text-left">
            &ldquo;{freeText}&rdquo;
          </div>
        )}
      </div>
    );
  }

  // CLARIFY SCREEN
  if (screen === "clarify") {
    return (
      <div className="max-w-lg mx-auto">
        {/* AI intro */}
        <div className="flex gap-3 items-start bg-[#EAF2FB] border border-[#CFE0F2] rounded-xl p-4 mb-5">
          <div className="w-7 h-7 rounded-lg bg-[#0B5FA5] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5-5.5l-2 2m-7 7l-2 2m11 0l-2-2m-7-7l-2-2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-[#0B5FA5]">Assistente clinico JetHealth</div>
            <div className="text-sm text-gray-700 mt-0.5">{clarifyIntro}</div>
          </div>
        </div>

        {/* Questions */}
        {questions.map((q) => (
          <Card key={q.id} className="p-4 mb-3">
            <div className="text-sm font-bold text-gray-900 mb-1">{q.text}</div>
            {q.hint && <div className="text-xs text-gray-400 mb-3">{q.hint}</div>}
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => {
                const isSelected = (answers[q.id] || []).includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleAnswer(q.id, opt, q.multi)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-colors ${
                      isSelected
                        ? "border-[#0B5FA5] bg-[#EAF2FB] text-[#0B5FA5] font-medium"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </Card>
        ))}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          className="w-full h-13 rounded-xl bg-[#0B5FA5] hover:bg-[#094d87] text-white font-bold text-base shadow-lg shadow-[#0B5FA5]/20 flex items-center justify-center gap-2 mt-2"
        >
          Concludi l&apos;analisi
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14m-6-6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>

        <p className="mt-3 text-center text-xs text-gray-400">
          In caso di peggioramento rapido chiama il 112/118.
        </p>
      </div>
    );
  }

  // ANALYZING SCREEN
  return (
    <div className="max-w-lg mx-auto py-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full border-4 border-gray-200 border-t-[#0B5FA5] animate-spin" />
      <h2 className="mt-6 text-lg font-bold text-gray-900">Sto preparando il tuo orientamento…</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-[270px]">
        L&apos;assistente clinico unisce la tua descrizione e le risposte a criteri di triage prudenti.
      </p>
      <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#0B5FA5] rounded-full animate-[jhBar_1.3s_ease_forwards]" style={{ width: "4%", animation: "jhBar 1.5s ease forwards" }} />
      </div>
    </div>
  );
}
