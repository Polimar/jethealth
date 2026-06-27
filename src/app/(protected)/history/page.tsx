"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { URGENCY_LEVELS } from "@/lib/triage-schema";
import Link from "next/link";

interface TriageRecord {
  id: string;
  symptoms_input: { text?: string };
  triage_result: { urgencyLevel?: string; actionLabel?: string };
  created_at: string;
}

export default function HistoryPage() {
  const [triages, setTriages] = useState<TriageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("jh_triage_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setTriages((data as TriageRecord[]) || []);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto py-12 flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B5FA5] rounded-full animate-spin" />
      </div>
    );
  }

  if (triages.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#9ca3af" strokeWidth="1.7" />
            <path d="M12 7v5l3 2" stroke="#9ca3af" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Nessun triage</h2>
        <p className="text-sm text-gray-500 mb-4">
          I tuoi triage passati appariranno qui dopo la prima analisi.
        </p>
        <Link href="/triage" className="text-sm text-[#0B5FA5] font-medium hover:underline">
          Inizia un&apos;analisi →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">I miei triage</h1>
      <div className="flex flex-col gap-3">
        {triages.map((triage) => {
          const result = triage.triage_result;
          const input = triage.symptoms_input;
          const level = result?.urgencyLevel || "medium";
          const urgency = URGENCY_LEVELS[level as keyof typeof URGENCY_LEVELS] || URGENCY_LEVELS.medium;
          const date = new Date(triage.created_at);
          const timeAgo = getTimeAgo(date);

          return (
            <Card key={triage.id} className="p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge
                      className="text-[10px] font-bold border-0"
                      style={{ background: urgency.bgColor, color: urgency.color }}
                    >
                      {urgency.label}
                    </Badge>
                    <span className="text-xs text-gray-400">{timeAgo}</span>
                  </div>
                  <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed">
                    {input?.text || "Sintomi non disponibili"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5 font-medium">
                    → {result?.actionLabel || ""}
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

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Adesso";
  if (minutes < 60) return `${minutes} min fa`;
  if (hours < 24) return `${hours} ore fa`;
  if (days < 7) return `${days} giorni fa`;
  return date.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}
