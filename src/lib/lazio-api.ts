/**
 * Adapter for the Salute Lazio facilities API.
 * API docs: https://salutelazio.it/it/strutture
 */

export interface Facility {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distanceKm: number;
  eta: number;
  type: "ps" | "farmacia" | "ambulatorio" | "consultorio" | "altro";
  typeLabel: string;
  url: string;
  emergencyOrganizationId?: string;
  specialties: string[];
}

const API_BASE = "https://server.salutelazio.it/server/external-services/facilities/structures/list";

const HEADERS = {
  accept: "application/json, text/plain, */*",
  authorization: "Bearer",
  origin: "https://salutelazio.it",
  referer: "https://salutelazio.it/",
  "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
};

interface SearchParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  facilityTypeIds?: string[];
  limit?: number;
}

export async function searchFacilities(params: SearchParams): Promise<Facility[]> {
  const { lat, lng, radiusKm = 10, facilityTypeIds = ["006"], limit = 20 } = params;

  const degOffset = radiusKm / 111;
  const queryParams = new URLSearchParams({
    westLng: String(lng - degOffset),
    southLat: String(lat - degOffset),
    eastLng: String(lng + degOffset),
    northLat: String(lat + degOffset),
    zoom: "12",
    lang: "it",
    page: "1",
    limit: String(limit),
    originLat: String(lat),
    originLng: String(lng),
    facilityTypeIds: facilityTypeIds.join(","),
  });

  const response = await fetch(`${API_BASE}?${queryParams}`, {
    headers: HEADERS,
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Salute Lazio API error: ${response.status}`);
  }

  const data = await response.json();
  const items: unknown[] = data?.items || [];

  if (!Array.isArray(items) || items.length === 0) return [];

  return items.map((raw, index) => normalizeItem(raw as Record<string, unknown>, index));
}

function normalizeItem(item: Record<string, unknown>, index: number): Facility {
  const geometry = item.geometry as Record<string, number> | undefined;
  const types = item.types as Array<Record<string, unknown>> | undefined;
  const firstType = types?.[0] as Record<string, unknown> | undefined;
  const typeCode = (firstType?.code as string) || "006";
  const typeLabels = firstType?.labels as Record<string, string> | undefined;

  const itemLat = geometry?.latitude || 0;
  const itemLng = geometry?.longitude || 0;
  const distanceKm = (item.distanceKm as number) || 0;

  return {
    id: (item.url as string) || `facility-${index}`,
    name: (item.name as string) || "Struttura",
    address: (item.plainAddress as string) || "",
    phone: (item.contactPhone as string) || "",
    lat: itemLat,
    lng: itemLng,
    distanceKm: Math.round(distanceKm * 10) / 10,
    eta: Math.max(1, Math.round((distanceKm / 30) * 60)),
    type: mapFacilityType(typeCode),
    typeLabel: typeLabels?.it || "Pronto Soccorso",
    url: `https://salutelazio.it/it/strutture/${item.url || ""}`,
    emergencyOrganizationId: (item.emergencyOrganizationId as string) || undefined,
    specialties: ["Generale"],
  };
}

function mapFacilityType(typeCode: string): Facility["type"] {
  if (typeCode === "006" || typeCode === "007") return "ps";
  if (typeCode === "003") return "farmacia";
  if (typeCode === "008" || typeCode === "009") return "ambulatorio";
  if (typeCode === "002") return "consultorio";
  return "altro";
}
