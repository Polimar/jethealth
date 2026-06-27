import { z } from "zod";

export const TriageInputSchema = z.object({
  symptomsText: z.string().min(10, "Descrivi i sintomi in almeno 10 caratteri"),
  patient: z.enum(["adulto", "bambino", "neonato", "anziano"]).default("adulto"),
  clarifyAnswers: z.record(z.array(z.string())).optional(),
});

export type TriageInput = z.infer<typeof TriageInputSchema>;

export const TriageResultSchema = z.object({
  urgencyLevel: z.enum(["low", "medium", "high", "emergency"]),
  actionLabel: z.string(),
  explanation: z.string(),
  nextSteps: z.array(z.string()),
  watchFor: z.array(z.string()),
  facilitySearchRequired: z.boolean(),
  specialtyNeeds: z.array(z.string()),
  confidence: z.enum(["bassa", "media", "alta"]),
  redFlagsDetected: z.array(z.string()).optional(),
});

export type TriageResult = z.infer<typeof TriageResultSchema>;

export const URGENCY_LEVELS = {
  low: { label: "Bassa urgenza", color: "#1E8A5B", bgColor: "#E7F4EE" },
  medium: { label: "Media urgenza", color: "#C58A1A", bgColor: "#FBF3E0" },
  high: { label: "Alta urgenza", color: "#D8552A", bgColor: "#FBEDE4" },
  emergency: { label: "Emergenza", color: "#C8312B", bgColor: "#FBE9E7" },
} as const;
