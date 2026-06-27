"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Disclaimer } from "@/components/disclaimer";
import { EmergencyBanner } from "@/components/emergency-banner";
import { UrgencyBadge } from "@/components/urgency-badge";
import { FeedbackWidget } from "@/components/feedback-widget";
import { generateTriagePdf } from "@/lib/pdf-summary";
import { type TriageInput, type TriageResult } from "@/lib/triage-schema";
import {
  Phone,
  MapPin,
  FileDown,
  ListChecks,
  Eye,
  LifeBuoy,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Stored = {
  result: TriageResult;
  triageId: string | null;
  input: TriageInput;
};

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Icon className="h-4 w-4 text-[#0B5FA5]" />
          {title}
        </h3>
        <div className="mt-2 text-sm text-slate-700">{children}</div>
      </CardContent>
    </Card>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<Stored | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("jethealth:lastTriage");
    if (!raw) {
      router.replace("/triage");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(JSON.parse(raw) as Stored);
  }, [router]);

  if (!data) return null;
  const { result, triageId, input } = data;
  const isUrgent =
    result.urgencyLevel === "high" || result.urgencyLevel === "emergency";

  const facilitiesHref = `/facilities?specialties=${encodeURIComponent(
    result.specialtyNeeds.join(","),
  )}&types=${result.urgencyLevel === "low" ? "009,003" : "006"}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Risultato</h1>
        <UrgencyBadge level={result.urgencyLevel} size="lg" />
      </div>

      {result.urgencyLevel === "emergency" && (
        <EmergencyBanner redFlags={result.redFlagsDetected} />
      )}

      {result.source === "rule_based" && (
        <p className="text-xs text-slate-400">
          Valutazione generata dal motore prudenziale di JetHealth.
        </p>
      )}

      <Section title="Spiegazione" icon={CheckCircle2}>
        {result.plainLanguageExplanation}
      </Section>

      {result.nextSteps.length > 0 && (
        <Section title="Cosa fare ora" icon={ListChecks}>
          <ul className="list-inside list-disc space-y-1">
            {result.nextSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Section>
      )}

      {result.watchFor.length > 0 && (
        <Section title="Cosa monitorare" icon={Eye}>
          <ul className="list-inside list-disc space-y-1">
            {result.watchFor.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Section>
      )}

      {result.redFlagsDetected.length > 0 &&
        result.urgencyLevel !== "emergency" && (
          <Section title="Quando preoccuparsi" icon={AlertTriangle}>
            <ul className="list-inside list-disc space-y-1">
              {result.redFlagsDetected.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </Section>
        )}

      {result.alternatives.length > 0 && (
        <Section title="Alternative al pronto soccorso" icon={LifeBuoy}>
          <ul className="list-inside list-disc space-y-1">
            {result.alternatives.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Section>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {isUrgent && (
          <a
            href="tel:112"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 font-semibold text-white shadow hover:bg-red-700"
          >
            <Phone className="h-5 w-5" /> Chiama il 112/118
          </a>
        )}
        <Link
          href={facilitiesHref}
          className={cn(buttonVariants({ variant: "outline" }), "h-12")}
        >
          <MapPin className="mr-1 h-5 w-5" /> Trova struttura vicina
        </Link>
        <Button
          variant="outline"
          className="h-12"
          onClick={() => generateTriagePdf(result, input)}
        >
          <FileDown className="mr-1 h-5 w-5" /> Scarica PDF riepilogo
        </Button>
      </div>

      <Card>
        <CardContent className="p-5">
          <FeedbackWidget triageId={triageId} />
        </CardContent>
      </Card>

      <Disclaimer text={result.safetyDisclaimer} />
    </div>
  );
}
