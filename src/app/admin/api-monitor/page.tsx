import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminApiMonitorPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const [
    { data: logs },
    { count: todayCount },
    { data: todayLogs },
  ] = await Promise.all([
    supabase
      .from("jh_api_call_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("jh_api_call_logs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today),
    supabase
      .from("jh_api_call_logs")
      .select("status_code, response_time_ms, tokens_used, service")
      .gte("created_at", today),
  ]);

  const successRate = todayLogs?.length
    ? Math.round((todayLogs.filter((l) => l.status_code === 200).length / todayLogs.length) * 100)
    : 100;

  const avgResponseTime = todayLogs?.length
    ? Math.round(todayLogs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / todayLogs.length)
    : 0;

  const tokensToday = todayLogs?.reduce((sum, l) => sum + (l.tokens_used || 0), 0) || 0;

  const stats = [
    { label: "Chiamate oggi", value: todayCount || 0 },
    { label: "Success rate", value: `${successRate}%` },
    { label: "Tempo medio", value: `${avgResponseTime}ms` },
    { label: "Token OpenAI", value: tokensToday },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Monitor API</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
            <div className="text-xl font-bold text-gray-900 mt-1">{stat.value}</div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Servizio</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Endpoint</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tempo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs?.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Badge variant={log.service === "openai" ? "default" : "secondary"}>
                      {log.service}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-mono text-xs">{log.endpoint}</td>
                  <td className="px-4 py-3">
                    <span className={log.status_code === 200 ? "text-green-600" : "text-red-600"}>
                      {log.status_code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.response_time_ms}ms</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(log.created_at).toLocaleString("it-IT")}
                  </td>
                </tr>
              ))}
              {(!logs || logs.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    Nessun log disponibile
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
