import OpenAI from "openai";
import type { TriageInput, TriageResult } from "./triage-schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Sei un assistente di triage sanitario PRUDENTE per la Regione Lazio (Italia).

REGOLE FONDAMENTALI:
- NON fai diagnosi definitive
- In caso di dubbio, scegli SEMPRE l'opzione più sicura (escalare)
- Linguaggio prudente, empatico e chiaro in italiano
- Includi SEMPRE un disclaimer di sicurezza
- Se rilevi segni di emergenza (dolore toracico, difficoltà respiratoria grave, perdita di coscienza, segni di ictus, emorragia grave, convulsioni, anafilassi), imposta urgencyLevel = "emergency"

SPECIALITA' DISPONIBILI (usa SOLO queste):
- Generale
- Neurologia / Stroke Unit
- Cardiologia / Emodinamica
- Pediatria
- Ostetricia / Ginecologia
- Trauma center

OUTPUT: Rispondi SOLO con un JSON valido con questa struttura:
{
  "urgencyLevel": "low|medium|high|emergency",
  "actionLabel": "breve azione consigliata in italiano",
  "explanation": "spiegazione in 2-3 frasi, rassicurante e prudente",
  "nextSteps": ["passo 1", "passo 2", "passo 3"],
  "watchFor": ["segnale d'allarme 1", "segnale 2", "segnale 3"],
  "facilitySearchRequired": true/false,
  "specialtyNeeds": ["specialità se serve"],
  "confidence": "bassa|media|alta"
}`;

export async function runTriageClassification(
  input: TriageInput
): Promise<TriageResult> {
  const patientLabel = {
    adulto: "adulto",
    bambino: "bambino (2-14 anni)",
    neonato: "neonato/lattante (0-2 anni)",
    anziano: "persona anziana (>65 anni)",
  }[input.patient];

  let userMessage = `Paziente: ${patientLabel}\nDescrizione sintomi: "${input.symptomsText}"`;

  if (input.clarifyAnswers && Object.keys(input.clarifyAnswers).length > 0) {
    userMessage += "\n\nRisposte di approfondimento:";
    for (const [question, answers] of Object.entries(input.clarifyAnswers)) {
      userMessage += `\n- ${question}: ${answers.join(", ")}`;
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 1024,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty response");

  const parsed = JSON.parse(content);

  return {
    urgencyLevel: parsed.urgencyLevel || "medium",
    actionLabel: parsed.actionLabel || "Consulta il medico di base",
    explanation: parsed.explanation || "Consultare un medico per una valutazione.",
    nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps.slice(0, 4) : [],
    watchFor: Array.isArray(parsed.watchFor) ? parsed.watchFor.slice(0, 4) : [],
    facilitySearchRequired: !!parsed.facilitySearchRequired,
    specialtyNeeds: Array.isArray(parsed.specialtyNeeds) ? parsed.specialtyNeeds : [],
    confidence: parsed.confidence || "media",
  };
}

export async function generateClarifyQuestions(
  symptomsText: string,
  patient: string
): Promise<{ intro: string; questions: Array<{ id: string; text: string; hint?: string; multi: boolean; options: string[] }> }> {
  const patientLabel = {
    adulto: "adulto",
    bambino: "bambino",
    neonato: "neonato",
    anziano: "persona anziana",
  }[patient] || "adulto";

  const prompt = `Sei un assistente di triage sanitario PRUDENTE per la Regione Lazio.
Paziente: ${patientLabel}. Descrizione sintomi: "${symptomsText}".

Genera da 3 a 4 domande di approfondimento in ITALIANO con 3-5 opzioni brevi ciascuna.
Includi sempre una domanda sui segnali d'allarme presenti ora.

Rispondi SOLO con JSON valido:
{"intro":"frase empatica breve","questions":[{"id":"durata","text":"...","hint":"","multi":false,"options":["..."]}]}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 800,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty response");

  const parsed = JSON.parse(content);
  return {
    intro: parsed.intro || "Qualche domanda per orientarti meglio.",
    questions: Array.isArray(parsed.questions)
      ? parsed.questions.slice(0, 5).map((q: Record<string, unknown>, i: number) => ({
          id: (q.id as string) || `q${i}`,
          text: (q.text as string) || "",
          hint: (q.hint as string) || "",
          multi: q.multi !== false,
          options: Array.isArray(q.options) ? (q.options as string[]).slice(0, 6) : [],
        }))
      : [],
  };
}
