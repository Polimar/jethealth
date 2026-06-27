import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalTriages },
    { count: todayTriages },
    { data: recentTriages },
    { data: feedbackData },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from("jh_triage_history").select("*", { count: "exact", head: true }),
    supabase.from("jh_triage_history").select("*", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("jh_triage_history").select("triage_result").gte("created_at", weekAgo),
    supabase.from("jh_feedback").select("rating"),
    supabase.from("jh_profiles").select("*", { count: "exact", head: true }),
  ]);

  const urgencyDistribution = { low: 0, medium: 0, high: 0, emergency: 0 };
  recentTriages?.forEach((t) => {
    const level = (t.triage_result as Record<string, unknown>)?.urgencyLevel as string;
    if (level && level in urgencyDistribution) {
      urgencyDistribution[level as keyof typeof urgencyDistribution]++;
    }
  });

  const avgRating = feedbackData?.length
    ? (feedbackData.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackData.length).toFixed(1)
    : "N/A";

  const stats = [
    { label: "Triage totali", value: totalTriages || 0, color: "#0B5FA5" },
    { label: "Oggi", value: todayTriages || 0, color: "#1E8A5B" },
    { label: "Utenti registrati", value: totalUsers || 0, color: "#6B7280" },
    { label: "Feedback medio", value: avgRating, color: "#C58A1A" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Admin</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              {stat.label}
            </div>
            <div className="text-2xl font-bold mt-1" style={{ color: stat.color }}>
              {stat.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Urgency distribution */}
      <Card className="p-6 mb-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Distribuzione urgenza (ultima settimana)</h2>
        <div className="flex gap-4">
          {Object.entries(urgencyDistribution).map(([level, count]) => {
            const colors: Record<string, string> = {
              low: "#1E8A5B",
              medium: "#C58A1A",
              high: "#D8552A",
              emergency: "#C8312B",
            };
            const labels: Record<string, string> = {
              low: "Bassa",
              medium: "Media",
              high: "Alta",
              emergency: "Emergenza",
            };
            return (
              <div key={level} className="flex-1 text-center">
                <div className="text-xl font-bold" style={{ color: colors[level] }}>
                  {count}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{labels[level]}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
