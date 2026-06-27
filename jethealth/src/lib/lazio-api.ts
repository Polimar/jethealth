import { bboxFromRadius } from "./geo/bounding-box";
import { getSetting } from "./settings";
import { logApiCall } from "./api-logger";
import { FACILITY_TYPE_LABELS } from "./constants/facility-types";

export interface RawSaluteLazioFacility {
  url: string;
  name: string;
  plainAddress: string;
  contactPhone: string;
  types: Array<{
    area: { code: string; labels: { it: string }; color: string };
    code: string;
    labels: { it: string };
  }>;
  emergencyOrganizationId: string | null;
  geometry: { longitude: number; latitude: number };
  distanceKm: number;
}

export interface NormalizedFacility {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number | null;
  typeCode: string;
  typeLabel: string;
  emergencyOrganizationId: string | null;
  navUrl: string;
  detailUrl: string;
}

type SearchParams = {
  lat: number;
  lng: number;
  radiusKm?: number;
  facilityTypeIds?: string[];
  limit?: number;
};

// Simple in-memory cache with TTL (facilities rarely change).
type CacheEntry = { data: NormalizedFacility[]; at: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 60 * 60 * 1000; // 1 hour

function headers() {
  return {
    accept: "application/json",
    authorization: "Bearer",
    origin: "https://salutelazio.it",
    referer: "https://salutelazio.it/",
  };
}

function normalize(raw: RawSaluteLazioFacility): NormalizedFacility {
  const t = raw.types?.[0];
  const code = t?.code ?? "";
  return {
    id: raw.url,
    name: raw.name,
    address: raw.plainAddress,
    phone: raw.contactPhone || null,
    latitude: raw.geometry?.latitude,
    longitude: raw.geometry?.longitude,
    distanceKm: typeof raw.distanceKm === "number" ? raw.distanceKm : null,
    typeCode: code,
    typeLabel: t?.labels?.it || FACILITY_TYPE_LABELS[code] || "Struttura",
    emergencyOrganizationId: raw.emergencyOrganizationId,
    navUrl:
      "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent(`${raw.name} ${raw.plainAddress}`),
    detailUrl: raw.url,
  };
}

export interface FacilityDetail extends NormalizedFacility {
  email: string | null;
  website: string | null;
  serviceLabels: string[];
  city: string | null;
  province: string | null;
}

const detailCache = new Map<string, { data: FacilityDetail; at: number }>();
const DETAIL_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * LazioHealthApiService: queries the public Salute Lazio facilities API,
 * normalizes the response, handles errors and caches results.
 */
export class LazioHealthApiService {
  static async detail(slug: string): Promise<FacilityDetail | null> {
    const cached = detailCache.get(slug);
    if (cached && Date.now() - cached.at < DETAIL_TTL_MS) return cached.data;

    const base = await getSetting("lazio_api_base_url");
    const url = new URL(`${base}/${encodeURIComponent(slug)}`);
    url.searchParams.set("lang", "it");
    const start = Date.now();
    try {
      const res = await fetch(url, { headers: headers(), signal: AbortSignal.timeout(12000) });
      await logApiCall({
        service: "salute_lazio",
        endpoint: "/structures/:slug",
        method: "GET",
        statusCode: res.status,
        responseTimeMs: Date.now() - start,
        errorMessage: res.ok ? undefined : `HTTP ${res.status}`,
      });
      if (!res.ok) return null;
      const raw = (await res.json()) as Record<string, unknown>;
      const t = (raw.facilityTypes as RawSaluteLazioFacility["types"])?.[0];
      const code = t?.code ?? "";
      const detail: FacilityDetail = {
        id: slug,
        name: String(raw.name ?? ""),
        address: String(raw.plainAddress ?? ""),
        phone: (raw.contactPhone as string) || null,
        latitude: raw.latitude as number,
        longitude: raw.longitude as number,
        distanceKm: null,
        typeCode: code,
        typeLabel: t?.labels?.it || FACILITY_TYPE_LABELS[code] || "Struttura",
        emergencyOrganizationId: (raw.emergencyOrganizationId as string) ?? null,
        navUrl:
          "https://www.google.com/maps/dir/?api=1&destination=" +
          encodeURIComponent(`${raw.name} ${raw.plainAddress}`),
        detailUrl: slug,
        email: (raw.contactEmail as string) || (raw.contactPecMail as string) || null,
        website: (raw.contactWebsite as string) || null,
        serviceLabels: Array.isArray(raw.serviceLabels)
          ? (raw.serviceLabels as Array<{ labels: { it: string } }>).map(
              (s) => s.labels?.it,
            ).filter(Boolean)
          : [],
        city: (raw.address as { city?: string })?.city ?? null,
        province: (raw.address as { province?: string })?.province ?? null,
      };
      detailCache.set(slug, { data: detail, at: Date.now() });
      return detail;
    } catch {
      await logApiCall({
        service: "salute_lazio",
        endpoint: "/structures/:slug",
        method: "GET",
        statusCode: 0,
        responseTimeMs: Date.now() - start,
        errorMessage: "fetch failed",
      });
      return null;
    }
  }

  static async search(params: SearchParams): Promise<NormalizedFacility[]> {
    const radiusKm =
      params.radiusKm ??
      (Number(await getSetting("facilities_default_radius_km")) || 8);
    const base = await getSetting("lazio_api_base_url");
    const types = params.facilityTypeIds?.length ? params.facilityTypeIds : ["006"];
    const limit = params.limit ?? 20;
    const bbox = bboxFromRadius(params.lat, params.lng, radiusKm);

    const cacheKey = JSON.stringify({ ...params, radiusKm, types, limit });
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.at < TTL_MS) return cached.data;

    const url = new URL(`${base}/list`);
    url.searchParams.set("westLng", String(bbox.westLng));
    url.searchParams.set("southLat", String(bbox.southLat));
    url.searchParams.set("eastLng", String(bbox.eastLng));
    url.searchParams.set("northLat", String(bbox.northLat));
    url.searchParams.set("zoom", "12");
    url.searchParams.set("lang", "it");
    url.searchParams.set("page", "1");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("originLat", String(params.lat));
    url.searchParams.set("originLng", String(params.lng));
    url.searchParams.set("facilityTypeIds", types.join(","));

    const start = Date.now();
    try {
      const res = await fetch(url, { headers: headers(), signal: AbortSignal.timeout(12000) });
      const elapsed = Date.now() - start;
      await logApiCall({
        service: "salute_lazio",
        endpoint: "/structures/list",
        method: "GET",
        statusCode: res.status,
        responseTimeMs: elapsed,
        errorMessage: res.ok ? undefined : `HTTP ${res.status}`,
      });
      if (!res.ok) throw new Error(`SaluteLazio HTTP ${res.status}`);
      const json = (await res.json()) as { total?: number; items?: RawSaluteLazioFacility[] };
      const items = (json.items ?? [])
        .filter((it) => it.geometry?.latitude && it.geometry?.longitude)
        .map(normalize);
      cache.set(cacheKey, { data: items, at: Date.now() });
      return items;
    } catch (err) {
      await logApiCall({
        service: "salute_lazio",
        endpoint: "/structures/list",
        method: "GET",
        statusCode: 0,
        responseTimeMs: Date.now() - start,
        errorMessage: err instanceof Error ? err.message : "unknown",
      });
      if (cached) return cached.data; // stale-on-error
      throw err;
    }
  }
}
