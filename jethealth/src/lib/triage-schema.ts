import { z } from "zod";

export const URGENCY_LEVELS = ["low", "medium", "high", "emergency"] as const;
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];

export const RECOMMENDED_ACTIONS = [
  "self_care",
  "doctor",
  "continuity_care",
  "pharmacy",
  "urgent_care",
  "emergency_room",
  "call_112_118",
] as const;

export const SPECIALTY_NEEDS = [
  "pediatria",
  "cardiologia",
  "neurologia",
  "traumatologia",
  "ostetricia_ginecologia",
  "generale",
] as const;
export type SpecialtyNeed = (typeof SPECIALTY_NEEDS)[number];

/** Structured input collected from the symptom intake (free text + guided). */
export const TriageInputSchema = z.object({
  patient: z.enum(["adulto", "bambino", "anziano"]).default("adulto"),
  freeText: z.string().max(4000).optional().default(""),
  duration: z
    .enum(["<24h", "1-3 giorni", ">3 giorni", ">1 settimana"])
    .nullable()
    .optional(),
  pain: z.number().int().min(0).max(10).default(0),
  fever: z.enum(["no", "lieve", "alta"]).default("no"),
  breath: z.enum(["no", "lieve", "marcata"]).default("no"),
  pregnant: z.boolean().default(false),
  factors: z.array(z.string()).default([]),
  redflags: z.array(z.string()).default([]),
});
export type TriageInput = z.infer<typeof TriageInputSchema>;

/** Structured AI/triage output. Mirrors the schema in prompt.md. */
export const TriageResultSchema = z.object({
  urgencyLevel: z.enum(URGENCY_LEVELS),
  recommendedAction: z.enum(RECOMMENDED_ACTIONS),
  plainLanguageExplanation: z.string(),
  redFlagsDetected: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  watchFor: z.array(z.string()).default([]),
  alternatives: z.array(z.string()).default([]),
  facilitySearchRequired: z.boolean(),
  preferredFacilityTypes: z.array(z.string()).default([]),
  specialtyNeeds: z.array(z.enum(SPECIALTY_NEEDS)).default([]),
  confidence: z.enum(["low", "medium", "high"]),
  safetyDisclaimer: z.string(),
  source: z.enum(["openai", "rule_based"]).default("rule_based"),
});
export type TriageResult = z.infer<typeof TriageResultSchema>;

export const RED_FLAGS = [
  "Dolore al petto intenso o senso di oppressione",
  "Difficoltà a respirare marcata",
  "Difficoltà a parlare o debolezza improvvisa di un lato del corpo",
  "Confusione improvvisa o perdita di coscienza",
  "Asimmetria del volto improvvisa",
  "Emorragia importante che non si arresta",
  "Reazione allergica grave (gonfiore volto/gola, difficoltà a respirare)",
  "Convulsioni",
  "Trauma cranico importante o trauma ad alta energia",
] as const;
