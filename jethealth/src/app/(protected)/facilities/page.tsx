"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FacilityCard } from "@/components/facility-card";
import { GuardiaMedicaCard } from "@/components/guardia-medica-card";
import { Disclaimer } from "@/components/disclaimer";
import {
  getBrowserLocation,
  geocodeAddressClient,
  saveLocation,
  loadLocation,
  DEFAULT_LOCATION,
  type Coords,
} from "@/lib/geolocation";
import { type RankedFacility } from "@/lib/facility-ranking";
import { MapPin, LocateFixed, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FacilityMap = dynamic(() => import("@/components/facility-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
      Caricamento mappa…
    </div>
  ),
});

const RADII = [3, 5, 8, 20];

function FacilitiesInner() {
  const params = useSearchParams();
  const typesParam = params.get("types") || "006";
  const specialties = params.get("specialties") || "";

  const [coords, setCoords] = useState<Coords | null>(null);
  const [radius, setRadius] = useState(8);
  const [address, setAddress] = useState("");
  const [facilities, setFacilities] = useState<RankedFacility[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const fetchFacilities = useCallback(
    async (c: Coords, r: number) => {
      setLoading(true);
      try {
        const url = `/api/facilities?lat=${c.lat}&lng=${c.lng}&radiusKm=${r}&types=${typesParam}&specialties=${specialties}`;
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error || "Errore nel caricamento strutture.");
          setFacilities([]);
        } else {
          setFacilities(json.facilities || []);
          if ((json.facilities || []).length === 0) {
            toast.info("Nessuna struttura trovata. Prova ad ampliare il raggio.");
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [typesParam, specialties],
  );

  useEffect(() => {
    const saved = loadLocation();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCoords(saved);
      fetchFacilities(saved, radius);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function useMyLocation() {
    setLocating(true);
    const loc = await getBrowserLocation();
    setLocating(false);
    const c = loc ?? DEFAULT_LOCATION;
    if (!loc) toast.info("Posizione non disponibile: uso il centro di Roma.");
    setCoords(c);
    saveLocation(c);
    fetchFacilities(c, radius);
  }

  async function searchAddress() {
    if (!address.trim()) return;
    setLocating(true);
    const c = await geocodeAddressClient(address);
    setLocating(false);
    if (!c) {
      toast.error("Indirizzo non trovato.");
      return;
    }
    setCoords(c);
    saveLocation(c);
    fetchFacilities(c, radius);
  }

  function useDefault() {
    setCoords(DEFAULT_LOCATION);
    saveLocation(DEFAULT_LOCATION);
    fetchFacilities(DEFAULT_LOCATION, radius);
  }

  function changeRadius(r: number) {
    setRadius(r);
    if (coords) fetchFacilities(coords, r);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Strutture sanitarie</h1>
        <p className="mt-1 text-sm text-slate-600">
          Trova la struttura più adatta nel Lazio.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={useMyLocation} disabled={locating} className="bg-[#0B5FA5] hover:bg-[#094d87]">
              {locating ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="mr-1 h-4 w-4" />
              )}
              Usa la mia posizione
            </Button>
            <Button variant="outline" onClick={useDefault}>
              <MapPin className="mr-1 h-4 w-4" /> Centro di Roma
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Oppure inserisci un indirizzo…"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchAddress()}
            />
            <Button variant="outline" onClick={searchAddress}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500">Raggio:</span>
            {RADII.map((r) => (
              <button
                key={r}
                onClick={() => changeRadius(r)}
                className={cn(
                  "rounded-lg border px-3 py-1 text-sm font-medium transition",
                  radius === r
                    ? "border-[#0B5FA5] bg-[#0B5FA5] text-white"
                    : "border-slate-200 bg-white text-slate-700",
                )}
              >
                {r} km
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {coords && (
        <div className="h-72 overflow-hidden rounded-xl border border-slate-200">
          <FacilityMap center={coords} facilities={facilities} />
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Ricerca in corso…
        </div>
      )}

      {!loading && facilities.length > 0 && (
        <div className="space-y-3">
          {facilities.map((f) => (
            <FacilityCard key={f.id} facility={f} />
          ))}
        </div>
      )}

      {!coords && (
        <p className="py-6 text-center text-sm text-slate-500">
          Seleziona una posizione per vedere le strutture vicine.
        </p>
      )}

      <GuardiaMedicaCard />
      <Disclaimer />
    </div>
  );
}

export default function FacilitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <FacilitiesInner />
    </Suspense>
  );
}
