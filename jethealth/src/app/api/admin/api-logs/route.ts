import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service");
  const status = searchParams.get("status"); // success | error

  const admin = createAdminClient();
  let query = admin
    .from("api_call_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (service) query = query.eq("service", service);
  if (status === "success") query = query.gte("status_code", 200).lt("status_code", 400);
  if (status === "error") query = query.or("status_code.gte.400,status_code.eq.0");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: todayLogs } = await admin
    .from("api_call_logs")
    .select("status_code, response_time_ms, tokens_used")
    .gte("created_at", today.toISOString());

  const total = todayLogs?.length ?? 0;
  const success =
    todayLogs?.filter((l) => l.status_code && l.status_code >= 200 && l.status_code < 400)
      .length ?? 0;
  const avgTime = total
    ? Math.round(
        (todayLogs?.reduce((a, l) => a + (l.response_time_ms ?? 0), 0) ?? 0) / total,
      )
    : 0;
  const tokens = todayLogs?.reduce((a, l) => a + (l.tokens_used ?? 0), 0) ?? 0;

  return NextResponse.json({
    logs: data,
    summary: {
      total,
      successRate: total ? Math.round((success / total) * 100) : 0,
      avgTimeMs: avgTime,
      tokensToday: tokens,
    },
  });
}
