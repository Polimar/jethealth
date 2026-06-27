import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UrgencyPie,
  TrendLine,
  FeedbackBar,
} from "@/components/admin/analytics-charts";
import { type TriageResult } from "@/lib/triage-schema";

function startOf(daysAgo: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

export default async function AdminDashboard() {
  const admin = createAdminClient();

  const { data: triages } = await admin
    .from("triage_history")
    .select("created_at, triage_result");
  const { data: feedbacks } = await admin.from("feedback").select("rating");

  const rows = triages ?? [];
  const now = new Date();
  const today = startOf(0);
  const week = startOf(7);
  const month = startOf(30);

  const countSince = (since: Date) =>
    rows.filter((r) => new Date(r.created_at) >= since).length;

  const urgencyCounts: Record<string, number> = {};
  let redirected = 0;
  for (const r of rows) {
    const level = (r.triage_result as TriageResult)?.urgencyLevel ?? "low";
    urgencyCounts[level] = (urgencyCounts[level] ?? 0) + 1;
    if (level === "low" || level === "medium") redirected += 1;
  }
  const urgencyData = Object.entries(urgencyCounts).map(([level, count]) => ({
    level,
    count,
  }));

  // 14-day trend
  const trend: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = startOf(i);
    const next = startOf(i - 1);
    const count = rows.filter((r) => {
      const t = new Date(r.created_at);
      return t >= day && t < next;
    }).length;
    trend.push({
      date: day.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" }),
      count,
    });
  }

  const fb = feedbacks ?? [];
  const avgFeedback = fb.length
    ? (fb.reduce((a, f) => a + f.rating, 0) / fb.length).toFixed(1)
    : "—";
  const feedbackDist = [1, 2, 3, 4, 5].map((n) => ({
    rating: `${n}★`,
    count: fb.filter((f) => f.rating === n).length,
  }));

  const stats = [
    { label: "Triage oggi", value: countSince(today) },
    { label: "Ultimi 7 giorni", value: countSince(week) },
    { label: "Ultimi 30 giorni", value: countSince(month) },
    {
      label: "Reindirizzati fuori dal PS",
      value: rows.length
        ? `${Math.round((redirected / rows.length) * 100)}%`
        : "—",
    },
    { label: "Feedback medio", value: avgFeedback },
  ];

  void now;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuzione urgenza</CardTitle>
          </CardHeader>
          <CardContent>
            <UrgencyPie data={urgencyData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trend triage (14 giorni)</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendLine data={trend} />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Distribuzione feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <FeedbackBar data={feedbackDist} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
