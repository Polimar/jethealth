import type { Facility } from "./lazio-api";

export interface RankedFacility extends Facility {
  rank: number;
  score: number;
  matchedSpecialty: string | null;
}

export function rankFacilities(
  facilities: Facility[],
  specialtyNeeds: string[],
  urgencyLevel: string
): RankedFacility[] {
  if (facilities.length === 0) return [];

  const isEmergency = urgencyLevel === "emergency" || urgencyLevel === "high";

  const wClinical = isEmergency ? 0.55 : 0.4;
  const wDistance = 0.30;
  const wAvailability = isEmergency ? 0.15 : 0.30;

  const scored = facilities
    .filter((f) => f.lat !== 0 && f.lng !== 0)
    .map((f) => {
      const maxDist = Math.max(...facilities.map((x) => x.distanceKm), 1);
      const distScore = 1 - Math.min(f.distanceKm / maxDist, 1);

      let clinScore = 0.5;
      let matchedSpecialty: string | null = null;

      if (specialtyNeeds.length > 0) {
        let matches = 0;
        for (const need of specialtyNeeds) {
          if (f.specialties.includes(need)) {
            matches++;
            matchedSpecialty = need;
          }
        }
        clinScore = matches > 0 ? 0.6 + 0.4 * (matches / specialtyNeeds.length) : 0.3;
      }

      const availScore = 0.5;
      const total = wClinical * clinScore + wDistance * distScore + wAvailability * availScore;

      return { ...f, score: total, matchedSpecialty };
    });

  scored.sort((a, b) => b.score - a.score);

  return scored.map((f, i) => ({ ...f, rank: i + 1 }));
}
