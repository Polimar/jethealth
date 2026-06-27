export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
};

/**
 * Geocodes an address via the free OSM Nominatim API. Italy-restricted.
 * Nominatim policy requires a descriptive User-Agent and <=1 req/sec.
 */
export async function geocodeAddress(
  query: string,
): Promise<GeocodeResult | null> {
  if (!query.trim()) return null;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("countrycodes", "it");
  url.searchParams.set("limit", "1");

  const res = await fetch(url, {
    headers: {
      "User-Agent": "JetHealth/1.0 (orientamento sanitario Lazio)",
      "Accept-Language": "it",
    },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  if (!data.length) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}
