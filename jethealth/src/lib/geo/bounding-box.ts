export type BBox = {
  westLng: number;
  southLat: number;
  eastLng: number;
  northLat: number;
};

/** Approximate bounding box around a center point given a radius in km. */
export function bboxFromRadius(lat: number, lng: number, radiusKm: number): BBox {
  const latDelta = radiusKm / 111; // ~111 km per degree of latitude
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    westLng: lng - lngDelta,
    southLat: lat - latDelta,
    eastLng: lng + lngDelta,
    northLat: lat + latDelta,
  };
}

/** Haversine distance in km. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const ROME_CENTER = { lat: 41.9028, lng: 12.4964 };
