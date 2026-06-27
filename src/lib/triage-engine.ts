/**
 * Rule-based red flag detection engine.
 * Runs BEFORE OpenAI to catch emergencies immediately and deterministically.
 */

const RED_FLAG_PATTERNS = [
  { pattern: /dolore al petto|oppressione.*petto|toracico intenso/i, label: "Dolore toracico" },
  { pattern: /non riesc[oa]? a respir|soffoc|dispnea grave|fiato.*corto.*improvvis/i, label: "Difficoltà respiratoria grave" },
  { pattern: /perdit[ao].*coscienza|svenut|svenimento|perso i sensi/i, label: "Perdita di coscienza" },
  { pattern: /non riesc[oa]? a parlare|volto.*storto|bocca.*storta|debolezza improvvis/i, label: "Segni di ictus" },
  { pattern: /emorragia|sangue.*non.*ferma/i, label: "Emorragia grave" },
  { pattern: /convulsion/i, label: "Convulsioni" },
  { pattern: /allergica.*grave|anafilat|labbra.*blu|cianos/i, label: "Reazione allergica grave / cianosi" },
];

export interface RedFlagResult {
  isEmergency: boolean;
  detectedFlags: string[];
}

export function detectRedFlags(symptomsText: string): RedFlagResult {
  const text = symptomsText.toLowerCase();
  const detectedFlags: string[] = [];

  for (const { pattern, label } of RED_FLAG_PATTERNS) {
    if (pattern.test(text)) {
      detectedFlags.push(label);
    }
  }

  return {
    isEmergency: detectedFlags.length > 0,
    detectedFlags,
  };
}

export function detectRedFlagsFromAnswers(answers: Record<string, string[]>): RedFlagResult {
  const allAnswers = Object.values(answers).flat().join(" ");
  return detectRedFlags(allAnswers);
}
