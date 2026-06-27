import { type NormalizedFacility } from "./lazio-api";
import { type SpecialtyNeed } from "./triage-schema";

export interface RankedFacility extends NormalizedFacility {
  score: number;
  matchReasons: string[];
}

const SPECIALTY_KEYWORDS: Record<SpecialtyNeed, string[]> = {
  pediatria: ["bambino", "pediatr", "gesù", "gesu"],
  cardiologia: ["cardiolog", "emodinamic", "cuore"],
  neurologia: ["neurolog", "stroke", "ictus"],
  traumatologia: ["trauma", "cto", "ortoped"],
  ostetricia_ginecologia: ["ostetric", "ginecolog", "maternit", "nascita"],
  generale: [],
};

/**
 * Composite ranking. Since the public API exposes no live waiting times,
 * the score combines: distance (50%), specialty match (35%), phone (10%),
 * data completeness (5%).
 */
export function rankFacilities(
  facilities: NormalizedFacility[],
  specialtyNeeds: SpecialtyNeed[] = [],
): RankedFacility[] {
  const distances = facilities
    .map((f) => f.distanceKm ?? Infinity)
    .filter((d) => Number.isFinite(d));
  const maxDist = distances.length ? Math.max(...distances) : 1;

  const ranked = facilities.map((f): RankedFacility => {
    const matchReasons: string[] = [];

    const dist = f.distanceKm ?? maxDist;
    const distanceScore = maxDist > 0 ? 1 - dist / maxDist : 1; // closer = higher

    let specialtyScore = 0;
    const haystack = `${f.name} ${f.address}`.toLowerCase();
    for (const need of specialtyNeeds) {
      if (need === "generale") continue;
      const kws = SPECIALTY_KEYWORDS[need] ?? [];
      if (kws.some((kw) => haystack.includes(kw))) {
        specialtyScore = 1;
        matchReasons.push(`Adatta per ${need.replace("_", "/")}`);
        break;
      }
    }

    const phoneScore = f.phone ? 1 : 0;
    if (f.phone) matchReasons.push("Contatto telefonico disponibile");

    const completenessScore = f.address && f.name ? 1 : 0;

    const score =
      distanceScore * 0.5 +
      specialtyScore * 0.35 +
      phoneScore * 0.1 +
      completenessScore * 0.05;

    if (Number.isFinite(dist)) {
      matchReasons.unshift(`A ${dist.toFixed(1)} km`);
    }

    return { ...f, score: Math.round(score * 100) / 100, matchReasons };
  });

  return ranked.sort((a, b) => b.score - a.score);
}
