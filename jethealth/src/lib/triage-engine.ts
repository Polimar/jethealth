import {
  type TriageInput,
  type TriageResult,
  type SpecialtyNeed,
  type UrgencyLevel,
} from "./triage-schema";

const DISCLAIMER =
  "JetHealth non sostituisce il parere di un medico. In caso di emergenza o peggioramento rapido, chiama subito il 112/118.";

const has = (list: string[], kw: string) =>
  list.some((x) => x.toLowerCase().includes(kw));

/**
 * Heuristic red-flag detection from free text. Conservative on purpose:
 * matches common emergency phrasings so the UI can interrupt immediately.
 */
export function detectRedFlagsFromText(text: string): string[] {
  const t = (text || "").toLowerCase();
  const found: string[] = [];
  const rules: Array<[RegExp, string]> = [
    [/dolore al petto|dolore toracic|oppression|fitta al petto/, "Dolore al petto intenso o senso di oppressione"],
    [/non riesc[oi] a respirare|fiato cort|affann|respiro affannoso|soffoc/, "Difficoltà a respirare marcata"],
    [/non riesc[oi] a parlare|difficolt.* a parlare|biascic/, "Difficoltà a parlare o debolezza improvvisa di un lato del corpo"],
    [/debolezza improvvisa|braccio.*non.*muov|gamba.*non.*muov|paralis/, "Difficoltà a parlare o debolezza improvvisa di un lato del corpo"],
    [/svenut|perdita di conoscenza|perso conoscenza|non risponde|incoscien/, "Confusione improvvisa o perdita di coscienza"],
    [/confusion|disorientat/, "Confusione improvvisa o perdita di coscienza"],
    [/volto storto|bocca storta|viso asimmetric/, "Asimmetria del volto improvvisa"],
    [/emorragia|sanguina.*molto|perdo molto sangue|sangue che non si ferma/, "Emorragia importante che non si arresta"],
    [/gonfiore.*gola|gola chiusa|shock anafilattico|anafila/, "Reazione allergica grave (gonfiore volto/gola, difficoltà a respirare)"],
    [/convulsion|crisi epilettic/, "Convulsioni"],
    [/trauma cranico|botta forte alla testa|caduta dall|incidente grave/, "Trauma cranico importante o trauma ad alta energia"],
  ];
  for (const [re, label] of rules) {
    if (re.test(t) && !found.includes(label)) found.push(label);
  }
  return found;
}

function deriveSpecialties(input: TriageInput, redflags: string[]): SpecialtyNeed[] {
  const out = new Set<SpecialtyNeed>();
  const rf = redflags.map((r) => r.toLowerCase());
  const txt = (input.freeText || "").toLowerCase();
  if (has(rf, "petto") || has(rf, "torac") || /cuore|cardiac|infarto|palpitazioni/.test(txt))
    out.add("cardiologia");
  if (
    has(rf, "parlare") ||
    has(rf, "debolezza") ||
    has(rf, "volto") ||
    has(rf, "coscienza") ||
    has(rf, "convulsion") ||
    /ictus|neurolog|mal di testa fortissimo/.test(txt)
  )
    out.add("neurologia");
  if (has(rf, "trauma") || /frattura|caduta|incidente|trauma/.test(txt))
    out.add("traumatologia");
  if (input.patient === "bambino") out.add("pediatria");
  if (input.pregnant || /gravidanz|incinta/.test(txt)) out.add("ostetricia_ginecologia");
  if (out.size === 0) out.add("generale");
  return [...out];
}

function actionFor(level: UrgencyLevel, input: TriageInput): TriageResult["recommendedAction"] {
  switch (level) {
    case "emergency":
      return "call_112_118";
    case "high":
      return "emergency_room";
    case "medium":
      return "doctor";
    case "low":
    default:
      return input.fever !== "no" || input.pain >= 2 ? "doctor" : "self_care";
  }
}

/**
 * Deterministic rule-based classification. Always used to (a) catch emergencies
 * before any AI call and (b) as a safe fallback when OpenAI is unavailable.
 */
export function classify(input: TriageInput): TriageResult {
  const textFlags = detectRedFlagsFromText(input.freeText || "");
  const redflags = Array.from(new Set([...(input.redflags || []), ...textFlags]));

  let level: UrgencyLevel;

  if (redflags.length > 0) {
    level = "emergency";
  } else if (
    input.breath === "marcata" ||
    input.pain >= 8 ||
    (input.fever === "alta" && input.breath === "lieve")
  ) {
    level = "high";
  } else if (
    input.fever === "alta" ||
    input.pain >= 5 ||
    input.breath === "lieve" ||
    (input.factors || []).includes("patologie") ||
    input.duration === ">3 giorni" ||
    input.duration === ">1 settimana"
  ) {
    level = "medium";
  } else {
    level = "low";
  }

  // Conservative bumps for fragile patients.
  if ((input.patient === "bambino" || input.patient === "anziano") && level === "low" && input.fever !== "no") {
    level = "medium";
  }

  const specialtyNeeds = deriveSpecialties(input, redflags);
  const recommendedAction = actionFor(level, input);
  const facilitySearchRequired = level === "high" || level === "emergency";

  const explanation: Record<UrgencyLevel, string> = {
    emergency:
      "Dai dati inseriti emergono segnali che possono indicare un'emergenza. Chiama subito il 112/118. Non metterti alla guida da solo se hai sintomi gravi.",
    high: "I sintomi indicati possono richiedere assistenza urgente. Ti consigliamo di chiamare il 112/118 o recarti al pronto soccorso. Qui sotto trovi le strutture più vicine e potenzialmente più adatte.",
    medium:
      "I sintomi indicati non sembrano un'emergenza immediata ma meritano attenzione medica. Ti consigliamo di contattare il medico di base o la continuità assistenziale (116117).",
    low: "Dai sintomi indicati non emergono segnali di emergenza immediata. Al momento potrebbe non essere necessario andare in pronto soccorso. Monitora i sintomi e contatta il medico di base se persistono o peggiorano.",
  };

  const nextSteps: Record<UrgencyLevel, string[]> = {
    emergency: [
      "Chiama subito il 112/118.",
      "Resta vicino a chi può aiutarti.",
      "Tieni a portata di mano farmaci e documenti sanitari.",
    ],
    high: [
      "Recati al pronto soccorso più adatto o chiama il 112/118.",
      "Se possibile, fatti accompagnare.",
      "Porta con te un documento e l'elenco dei farmaci che assumi.",
    ],
    medium: [
      "Contatta il medico di base o la continuità assistenziale (116117).",
      "Riposa e idratati adeguatamente.",
      "Annota l'andamento dei sintomi.",
    ],
    low: [
      "Monitora i sintomi nelle prossime 24-48 ore.",
      "Riposa e mantieni una buona idratazione.",
      "Contatta il medico di base se i sintomi persistono o peggiorano.",
    ],
  };

  const watchFor = [
    "Comparsa di dolore al petto o senso di oppressione",
    "Difficoltà a respirare",
    "Confusione, difficoltà a parlare o debolezza improvvisa",
    "Svenimento o peggioramento rapido",
  ];

  const alternatives =
    level === "low" || level === "medium"
      ? [
          "Medico di base",
          "Continuità assistenziale / Guardia medica (116117)",
          "Farmacia di fiducia",
          "Teleconsulto",
        ]
      : [];

  return {
    urgencyLevel: level,
    recommendedAction,
    plainLanguageExplanation: explanation[level],
    redFlagsDetected: redflags,
    nextSteps: nextSteps[level],
    watchFor,
    alternatives,
    facilitySearchRequired,
    preferredFacilityTypes: facilitySearchRequired ? ["006"] : ["009", "003"],
    specialtyNeeds,
    confidence: redflags.length > 0 ? "high" : "medium",
    safetyDisclaimer: DISCLAIMER,
    source: "rule_based",
  };
}
