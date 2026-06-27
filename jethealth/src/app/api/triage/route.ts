import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TriageInputSchema } from "@/lib/triage-schema";
import { runTriage } from "@/lib/openai-triage";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body non valido" }, { status: 400 });
  }

  const parsed = TriageInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Input non valido", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  let result;
  try {
    result = await runTriage(parsed.data);
  } catch (err) {
    console.error("[triage] error:", err);
    return NextResponse.json(
      {
        error:
          "Servizio temporaneamente non disponibile, riprova tra qualche minuto.",
      },
      { status: 503 },
    );
  }

  // Persist only if the user consented to data storage.
  let triageId: string | null = null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("consent_data_storage")
    .eq("id", user.id)
    .single();

  if (profile?.consent_data_storage) {
    const { data: inserted } = await supabase
      .from("triage_history")
      .insert({
        user_id: user.id,
        symptoms_input: parsed.data,
        triage_result: result,
      })
      .select("id")
      .single();
    triageId = inserted?.id ?? null;
  }

  return NextResponse.json({ result, triageId });
}
