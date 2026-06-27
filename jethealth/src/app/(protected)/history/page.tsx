import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { UrgencyBadge } from "@/components/urgency-badge";
import { type TriageResult } from "@/lib/triage-schema";
import { History } from "lucide-react";

export default async function HistoryPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("triage_history")
    .select("id, created_at, triage_result")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Cronologia triage</h1>

      {!profile?.consent_data_storage && (
        <p className="text-sm text-slate-500">
          Il salvataggio dei dati è disattivato per il tuo account.
        </p>
      )}

      {(!rows || rows.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-slate-500">
            <History className="h-8 w-8" />
            <p>Nessun triage salvato finora.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {rows?.map((r) => {
          const result = r.triage_result as TriageResult;
          return (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(r.created_at).toLocaleString("it-IT")}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-slate-600">
                    {result.plainLanguageExplanation}
                  </p>
                </div>
                <UrgencyBadge level={result.urgencyLevel} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
