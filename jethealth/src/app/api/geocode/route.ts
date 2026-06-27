import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geo/nominatim";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  if (!q.trim()) {
    return NextResponse.json({ error: "Query mancante" }, { status: 400 });
  }
  try {
    const result = await geocodeAddress(q);
    if (!result) {
      return NextResponse.json({ error: "Indirizzo non trovato" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geocoding non disponibile" }, { status: 502 });
  }
}
