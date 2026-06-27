import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { URGENCY_LEVELS } from "@/lib/triage-schema";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: triages } = await supabase
    .from("jh_triage_history")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!triages || triages.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#9ca3af" strokeWidth="1.7" />
            <path d="M12 7v5l3 2" stroke="#9ca3af" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Nessun triage</h2>
        <p className="text-sm text-gray-500">
          I tuoi triage passati appariranno qui dopo la prima analisi.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">I miei triage</h1>
      <div className="flex flex-col gap-3">
        {triages.map((triage) => {
          const result = triage.triage_result as Record<string, unknown>;
          const input = triage.symptoms_input as Record<string, unknown>;
          const level = result?.urgencyLevel as string;
          const urgency = URGENCY_LEVELS[level as keyof typeof URGENCY_LEVELS] || URGENCY_LEVELS.medium;
          const date = new Date(triage.created_at).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <Card key={triage.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      className="text-[10px] font-bold"
                      style={{ background: urgency.bgColor, color: urgency.color }}
                    >
                      {urgency.label}
                    </Badge>
                    <span className="text-xs text-gray-400">{date}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {(input?.text as string) || "Sintomi non disponibili"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(result?.actionLabel as string) || ""}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
