import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchFacilities } from "@/lib/lazio-api";
import { rankFacilities } from "@/lib/facility-ranking";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "41.8933");
  const lng = parseFloat(searchParams.get("lng") || "12.4829");
  const specialtyNeeds = searchParams.get("specialties")?.split(",").filter(Boolean) || [];
  const urgencyLevel = searchParams.get("urgency") || "medium";
  const facilityType = searchParams.get("type") || "006";

  const startTime = Date.now();

  try {
    const facilities = await searchFacilities({
      lat,
      lng,
      radiusKm: 10,
      facilityTypeIds: [facilityType],
      limit: 15,
    });

    const elapsed = Date.now() - startTime;

    await supabase.from("jh_api_call_logs").insert({
      service: "salute_lazio",
      endpoint: "/structures/list",
      method: "GET",
      status_code: 200,
      response_time_ms: elapsed,
    });

    const ranked = rankFacilities(facilities, specialtyNeeds, urgencyLevel);

    return NextResponse.json({ facilities: ranked, total: ranked.length });
  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.error("Salute Lazio API error:", err);

    await supabase.from("jh_api_call_logs").insert({
      service: "salute_lazio",
      endpoint: "/structures/list",
      method: "GET",
      status_code: 500,
      response_time_ms: elapsed,
      error_message: err instanceof Error ? err.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Impossibile caricare le strutture. Riprova." },
      { status: 503 }
    );
  }
}
