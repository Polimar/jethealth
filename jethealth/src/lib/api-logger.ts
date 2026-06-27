import { createAdminClient } from "./supabase/admin";

type ApiLog = {
  service: "openai" | "salute_lazio";
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTimeMs?: number;
  tokensUsed?: number;
  errorMessage?: string;
};

/**
 * Persists a technical API-call log. Never includes symptom/clinical data.
 * Failures here must never break the request flow, so they are swallowed.
 */
export async function logApiCall(log: ApiLog): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("api_call_logs").insert({
      service: log.service,
      endpoint: log.endpoint ?? null,
      method: log.method ?? null,
      status_code: log.statusCode ?? null,
      response_time_ms: log.responseTimeMs ?? null,
      tokens_used: log.tokensUsed ?? null,
      error_message: log.errorMessage ?? null,
    });
  } catch (err) {
    console.error("[api-logger] failed to log api call:", err);
  }
}
