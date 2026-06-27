import OpenAI from "openai";
import {
  TriageResultSchema,
  type TriageInput,
  type TriageResult,
} from "./triage-schema";
import { classify, detectRedFlagsFromText } from "./triage-engine";
import { DEFAULT_SYSTEM_PROMPT } from "./ai/triage-system-prompt";
import { getSettings } from "./settings";
import { logApiCall } from "./api-logger";

function buildUserMessage(input: TriageInput): string {
  const parts: string[] = [];
  parts.push(`Paziente: ${input.patient}`);
  if (input.freeText?.trim()) parts.push(`Descrizione: ${input.freeText.trim()}`);
  if (input.duration) parts.push(`Durata sintomi: ${input.duration}`);
  parts.push(`Intensità dolore (0-10): ${input.pain}`);
  parts.push(`Febbre: ${input.fever}`);
  parts.push(`Difficoltà respiratorie: ${input.breath}`);
  if (input.pregnant) parts.push("Gravidanza: sì");
  if (input.factors?.length) parts.push(`Fattori: ${input.factors.join(", ")}`);
  if (input.redflags?.length)
    parts.push(`Red flags segnalati: ${input.redflags.join(", ")}`);
  return parts.join("\n");
}

/**
 * Hybrid triage:
 * 1. Rule-based red-flag detection runs first (deterministic). Any red flag
 *    short-circuits to an emergency result without calling OpenAI.
 * 2. If an OPENAI_API_KEY is configured, OpenAI refines the classification and
 *    produces the natural-language explanation.
 * 3. If the key is missing or OpenAI fails, the deterministic rule-based
 *    classifier is used as a safe fallback (keeps dev/demo fully functional).
 */
export async function runTriage(input: TriageInput): Promise<TriageResult> {
  const ruleBased = classify(input);

  // Emergency caught by rules -> never delay with an API call.
  if (ruleBased.urgencyLevel === "emergency") {
    return ruleBased;
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return ruleBased;
  }

  const settings = await getSettings();
  const model = settings.openai_model || "gpt-4o";
  const maxTokens = Number(settings.openai_max_tokens || "1200");
  const systemPrompt = settings.openai_system_prompt?.trim() || DEFAULT_SYSTEM_PROMPT;

  const client = new OpenAI({ apiKey });
  const start = Date.now();
  try {
    const completion = await client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserMessage(input) },
      ],
    });

    const elapsed = Date.now() - start;
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = TriageResultSchema.safeParse({
      ...JSON.parse(raw),
      source: "openai",
    });

    await logApiCall({
      service: "openai",
      endpoint: "/chat/completions",
      method: "POST",
      statusCode: 200,
      responseTimeMs: elapsed,
      tokensUsed: completion.usage?.total_tokens,
    });

    if (!parsed.success) {
      return ruleBased;
    }

    // Conservative safety net: never let the model downgrade a detected red flag.
    const textFlags = detectRedFlagsFromText(input.freeText || "");
    if (
      (input.redflags?.length || textFlags.length) &&
      parsed.data.urgencyLevel !== "emergency"
    ) {
      return ruleBased;
    }
    return parsed.data;
  } catch (err) {
    await logApiCall({
      service: "openai",
      endpoint: "/chat/completions",
      method: "POST",
      statusCode: 500,
      responseTimeMs: Date.now() - start,
      errorMessage: err instanceof Error ? err.message : "unknown",
    });
    // Fallback keeps the app usable; emergencies were already handled above.
    return ruleBased;
  }
}
