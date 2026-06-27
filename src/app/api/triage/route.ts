import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TriageInputSchema } from "@/lib/triage-schema";
import { detectRedFlags } from "@/lib/triage-engine";
import { runTriageClassification, generateClarifyQuestions } from "@/lib/openai-triage";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  // Generate clarifying questions
  if (action === "clarify") {
    const { symptomsText } = body;
    if (!symptomsText || symptomsText.length < 5) {
      return NextResponse.json({ error: "Descrizione troppo breve" }, { status: 400 });
    }

    // Check red flags first
    const redFlagCheck = detectRedFlags(symptomsText);
    if (redFlagCheck.isEmergency) {
      return NextResponse.json({
        isEmergency: true,
        redFlags: redFlagCheck.detectedFlags,
      });
    }

    try {
      const questions = await generateClarifyQuestions(symptomsText);
      return NextResponse.json(questions);
    } catch (err) {
      console.error("OpenAI clarify error:", err);
      return NextResponse.json({
        intro: "Per orientarti al meglio, rispondi a queste domande di sicurezza.",
        questions: getDefaultQuestions(),
        isFallback: true,
      });
    }
  }

  // Full triage classification
  if (action === "classify") {
    const parsed = TriageInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const input = parsed.data;

    // Check red flags
    const allText = input.symptomsText + " " +
      Object.values(input.clarifyAnswers || {}).flat().join(" ");
    const redFlagCheck = detectRedFlags(allText);

    if (redFlagCheck.isEmergency) {
      const emergencyResult = {
        urgencyLevel: "emergency" as const,
        actionLabel: "Chiama subito il 112/118",
        explanation: "I sintomi che hai indicato possono richiedere assistenza urgente. Ti consigliamo di chiamare subito il 112/118 o recarti al pronto soccorso.",
        nextSteps: ["Chiama il 112/118", "Resta in un luogo sicuro", "Fatti assistere da qualcuno"],
        watchFor: [],
        facilitySearchRequired: true,
        specialtyNeeds: deriveSpecialtyNeeds(allText, input.patient),
        confidence: "alta" as const,
        redFlagsDetected: redFlagCheck.detectedFlags,
      };

      await saveTriage(supabase, user.id, input, emergencyResult);
      return NextResponse.json(emergencyResult);
    }

    const startTime = Date.now();
    try {
      const result = await runTriageClassification(input);
      const elapsed = Date.now() - startTime;

      // Log API call
      await supabase.from("jh_api_call_logs").insert({
        service: "openai",
        endpoint: "/v1/chat/completions",
        method: "POST",
        status_code: 200,
        response_time_ms: elapsed,
      });

      await saveTriage(supabase, user.id, input, result);
      return NextResponse.json(result);
    } catch (err) {
      const elapsed = Date.now() - startTime;
      console.error("OpenAI triage error:", err);

      await supabase.from("jh_api_call_logs").insert({
        service: "openai",
        endpoint: "/v1/chat/completions",
        method: "POST",
        status_code: 500,
        response_time_ms: elapsed,
        error_message: err instanceof Error ? err.message : "Unknown error",
      });

      return NextResponse.json(
        { error: "Servizio temporaneamente non disponibile, riprova tra qualche minuto." },
        { status: 503 }
      );
    }
  }

  return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
}

async function saveTriage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  input: { symptomsText: string; patient: string; clarifyAnswers?: Record<string, string[]> },
  result: Record<string, unknown>
) {
  const { data: profile } = await supabase
    .from("jh_profiles")
    .select("consent_data_storage")
    .eq("id", userId)
    .single();

  if (profile?.consent_data_storage) {
    await supabase.from("jh_triage_history").insert({
      user_id: userId,
      symptoms_input: {
        text: input.symptomsText,
        patient: input.patient,
        clarifyAnswers: input.clarifyAnswers,
      },
      triage_result: result,
    });
  }
}

function deriveSpecialtyNeeds(text: string, patient: string): string[] {
  const t = text.toLowerCase();
  const needs: string[] = [];
  if (/petto|torac|cuore|cardiac|infarto/.test(t)) needs.push("Cardiologia / Emodinamica");
  if (/parlare|debolezza|ictus|coscienza|confus|volto|neurolog/.test(t)) needs.push("Neurologia / Stroke Unit");
  if (/trauma|caduta|incidente|frattur/.test(t)) needs.push("Trauma center");
  if (patient === "bambino" || patient === "neonato") needs.push("Pediatria");
  if (/gravidanz|incinta/.test(t)) needs.push("Ostetricia / Ginecologia");
  return needs;
}

function getDefaultQuestions() {
  return [
    { id: "segnali", text: "È presente ORA uno di questi segnali?", hint: "Seleziona tutti quelli presenti", multi: true, options: ["Dolore al petto intenso", "Difficoltà a respirare marcata", "Perdita di coscienza", "Difficoltà a parlare o debolezza improvvisa", "Nessuno di questi"] },
    { id: "durata", text: "Da quanto tempo hai questi sintomi?", hint: "", multi: false, options: ["Oggi", "1-3 giorni", "Più di 3 giorni", "Più di una settimana"] },
    { id: "intensita", text: "Quanto è intenso il malessere?", hint: "", multi: false, options: ["Lieve", "Moderato", "Forte", "Insopportabile"] },
    { id: "febbre", text: "Hai febbre?", hint: "", multi: false, options: ["No", "Fino a 38°", "38-39°", "Oltre 39°"] },
  ];
}
