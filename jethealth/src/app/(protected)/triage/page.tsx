"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Disclaimer } from "@/components/disclaimer";
import { EmergencyBanner } from "@/components/emergency-banner";
import { RED_FLAGS, type TriageInput } from "@/lib/triage-schema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PATIENTS = [
  { value: "adulto", label: "Adulto" },
  { value: "bambino", label: "Bambino" },
  { value: "anziano", label: "Anziano" },
] as const;

const DURATIONS = ["<24h", "1-3 giorni", ">3 giorni", ">1 settimana"] as const;
const FEVERS = [
  { value: "no", label: "No" },
  { value: "lieve", label: "Lieve" },
  { value: "alta", label: "Alta" },
] as const;
const BREATHS = [
  { value: "no", label: "No" },
  { value: "lieve", label: "Lieve" },
  { value: "marcata", label: "Marcata" },
] as const;
const FACTORS = [
  { value: "patologie", label: "Patologie note" },
  { value: "farmaci", label: "Assumo farmaci" },
  { value: "allergie", label: "Allergie note" },
];

function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[] | readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  const norm = options.map((o) =>
    typeof o === "string" ? { value: o as T, label: o } : o,
  );
  return (
    <div className="flex flex-wrap gap-2">
      {norm.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg border px-4 py-2 text-sm font-medium transition",
            value === o.value
              ? "border-[#0B5FA5] bg-[#0B5FA5] text-white"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function TriagePage() {
  const router = useRouter();
  const [input, setInput] = useState<TriageInput>({
    patient: "adulto",
    freeText: "",
    duration: null,
    pain: 0,
    fever: "no",
    breath: "no",
    pregnant: false,
    factors: [],
    redflags: [],
  });
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof TriageInput>(k: K, v: TriageInput[K]) =>
    setInput((s) => ({ ...s, [k]: v }));

  const toggleArray = (key: "factors" | "redflags", value: string) =>
    setInput((s) => {
      const arr = s[key];
      return {
        ...s,
        [key]: arr.includes(value)
          ? arr.filter((x) => x !== value)
          : [...arr, value],
      };
    });

  const hasRedFlag = input.redflags.length > 0;

  async function submit() {
    if (!input.freeText?.trim() && input.pain === 0 && input.fever === "no") {
      toast.error("Descrivi i sintomi o compila il percorso guidato.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Errore durante l'analisi.");
        setLoading(false);
        return;
      }
      sessionStorage.setItem(
        "jethealth:lastTriage",
        JSON.stringify({ result: json.result, triageId: json.triageId, input }),
      );
      router.push("/triage/result");
    } catch {
      toast.error("Errore di rete. Riprova.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Analizza i tuoi sintomi
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Più dettagli fornisci, più precisa sarà l&apos;indicazione.
        </p>
      </div>

      {/* Red flag check — always visible, interrupts flow */}
      <Card className="border-red-100">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-red-700">
            Hai uno di questi segnali in questo momento?
          </p>
          <div className="mt-3 space-y-2">
            {RED_FLAGS.map((rf) => (
              <label
                key={rf}
                className="flex items-start gap-2 text-sm text-slate-700"
              >
                <Checkbox
                  checked={input.redflags.includes(rf)}
                  onCheckedChange={() => toggleArray("redflags", rf)}
                  className="mt-0.5"
                />
                <span>{rf}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {hasRedFlag ? (
        <EmergencyBanner redFlags={input.redflags} />
      ) : (
        <>
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-2">
                <Label>Chi ha i sintomi?</Label>
                <Seg
                  options={PATIENTS}
                  value={input.patient}
                  onChange={(v) => set("patient", v)}
                />
              </div>

              <Tabs defaultValue="text">
                <TabsList className="w-full">
                  <TabsTrigger value="text" className="flex-1">
                    Descrizione libera
                  </TabsTrigger>
                  <TabsTrigger value="guided" className="flex-1">
                    Percorso guidato
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="pt-4">
                  <Textarea
                    placeholder="Es. Ho febbre a 38,5, mal di gola e tosse da due giorni…"
                    rows={5}
                    value={input.freeText}
                    onChange={(e) => set("freeText", e.target.value)}
                  />
                </TabsContent>

                <TabsContent value="guided" className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <Label>Da quanto tempo?</Label>
                    <Seg
                      options={DURATIONS}
                      value={(input.duration ?? "") as (typeof DURATIONS)[number]}
                      onChange={(v) => set("duration", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Intensità del dolore: {input.pain}/10</Label>
                    <Slider
                      value={[input.pain]}
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(v) =>
                        set("pain", Array.isArray(v) ? v[0] : v)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Febbre</Label>
                    <Seg
                      options={FEVERS}
                      value={input.fever}
                      onChange={(v) => set("fever", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Difficoltà respiratorie</Label>
                    <Seg
                      options={BREATHS}
                      value={input.breath}
                      onChange={(v) => set("breath", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fattori rilevanti</Label>
                    <div className="space-y-2">
                      {FACTORS.map((f) => (
                        <label
                          key={f.value}
                          className="flex items-center gap-2 text-sm text-slate-700"
                        >
                          <Checkbox
                            checked={input.factors.includes(f.value)}
                            onCheckedChange={() =>
                              toggleArray("factors", f.value)
                            }
                          />
                          {f.label}
                        </label>
                      ))}
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <Checkbox
                          checked={input.pregnant}
                          onCheckedChange={(v) => set("pregnant", v === true)}
                        />
                        Gravidanza in corso
                      </label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Button
            onClick={submit}
            disabled={loading}
            className="h-12 w-full bg-[#0B5FA5] text-base hover:bg-[#094d87]"
          >
            {loading ? "Analisi in corso…" : "Analizza i sintomi"}
          </Button>
          <Disclaimer />
        </>
      )}
    </div>
  );
}
