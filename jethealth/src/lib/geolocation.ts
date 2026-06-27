"use client";

import { ROME_CENTER } from "./geo/bounding-box";

export type Coords = { lat: number; lng: number };

const STORAGE_KEY = "jethealth:last-location";

/** Requests the browser geolocation. Resolves null on denial/timeout/failure. */
export function getBrowserLocation(timeoutMs = 8000): Promise<Coords | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: timeoutMs, maximumAge: 60_000, enableHighAccuracy: false },
    );
  });
}

export async function geocodeAddressClient(query: string): Promise<Coords | null> {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.lat && data?.lng) return { lat: data.lat, lng: data.lng };
  return null;
}

export function saveLocation(c: Coords) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {}
}

export function loadLocation(): Coords | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Coords) : null;
  } catch {
    return null;
  }
}

export const DEFAULT_LOCATION = ROME_CENTER;
