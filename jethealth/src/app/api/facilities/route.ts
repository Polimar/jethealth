import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LazioHealthApiService } from "@/lib/lazio-api";
import { rankFacilities } from "@/lib/facility-ranking";
import { SPECIALTY_NEEDS, type SpecialtyNeed } from "@/lib/triage-schema";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "Coordinate mancanti" }, { status: 400 });
  }

  const radiusKm = searchParams.get("radiusKm")
    ? Number(searchParams.get("radiusKm"))
    : undefined;
  const types = searchParams.get("types")?.split(",").filter(Boolean);
  const specialtyNeeds = (searchParams.get("specialties")?.split(",") ?? [])
    .filter((s): s is SpecialtyNeed =>
      (SPECIALTY_NEEDS as readonly string[]).includes(s),
    );

  try {
    const facilities = await LazioHealthApiService.search({
      lat,
      lng,
      radiusKm,
      facilityTypeIds: types,
    });
    const ranked = rankFacilities(facilities, specialtyNeeds);
    return NextResponse.json({ facilities: ranked });
  } catch {
    return NextResponse.json(
      {
        error:
          "Impossibile caricare le strutture. Puoi cercare manualmente su salutelazio.it",
        facilities: [],
      },
      { status: 502 },
    );
  }
}
