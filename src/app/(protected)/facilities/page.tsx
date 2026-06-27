"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MapView = dynamic(() => import("@/components/facility-map"), { ssr: false });

interface Facility {
  id: string;
  name: string;
  address: string;
  phone: string;
  distanceKm: number;
  eta: number;
  lat: number;
  lng: number;
  rank: number;
  score: number;
  matchedSpecialty: string | null;
  type: string;
  typeLabel: string;
  url: string;
}

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          fetchFacilities(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Default to Rome center
          setUserLocation({ lat: 41.8933, lng: 12.4829 });
          fetchFacilities(41.8933, 12.4829);
        },
        { timeout: 5000 }
      );
    } else {
      setUserLocation({ lat: 41.8933, lng: 12.4829 });
      fetchFacilities(41.8933, 12.4829);
    }
  }, []);

  async function fetchFacilities(lat: number, lng: number) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/facilities?lat=${lat}&lng=${lng}&type=006`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setFacilities(data.facilities || []);
      }
    } catch {
      setError("Errore nel caricamento delle strutture");
    }
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B5FA5] rounded-full animate-spin" />
        <p className="mt-4 text-sm text-gray-500">Caricamento strutture...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Strutture consigliate</h1>
          <p className="text-xs text-gray-500">Ordinate per adeguatezza · {facilities.length} strutture</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#0B5FA5] font-semibold bg-[#EAF2FB] px-2.5 py-1.5 rounded-lg">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="#0B5FA5" strokeWidth="1.8" />
          </svg>
          Salute Lazio
        </div>
      </div>

      {error && (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          {error}. Vengono mostrate le strutture principali di Roma.
        </div>
      )}

      {/* Map */}
      {userLocation && (
        <div className="rounded-xl overflow-hidden border border-gray-200 mb-4 h-48">
          <MapView
            center={userLocation}
            facilities={facilities}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-3">
        {facilities.map((f) => (
          <Card
            key={f.id}
            className={`p-4 cursor-pointer transition-all ${
              selectedId === f.id ? "ring-2 ring-[#0B5FA5]" : ""
            } ${f.rank === 1 ? "border-[#0B5FA5]" : ""}`}
            onClick={() => setSelectedId(f.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                f.rank === 1 ? "bg-[#0B5FA5]" : f.rank <= 3 ? "bg-[#3E7FBE]" : "bg-[#8AA4BE]"
              }`}>
                {f.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">{f.name}</span>
                  {f.rank === 1 && (
                    <span className="text-[10px] font-bold uppercase text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                      Consigliato
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{f.address}</div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    {f.typeLabel || "Pronto Soccorso"}
                  </span>
                  {f.matchedSpecialty && (
                    <span className="text-[11px] font-semibold text-[#0B5FA5] bg-[#EAF2FB] px-2 py-0.5 rounded-md">
                      {f.matchedSpecialty}
                    </span>
                  )}
                </div>
                <div className="flex gap-4 mt-2.5">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{f.distanceKm} km</div>
                    <div className="text-[10px] text-gray-400 uppercase">{f.eta}′ auto</div>
                  </div>
                  {f.phone && (
                    <div>
                      <a href={`tel:${f.phone}`} className="text-sm font-bold text-[#0B5FA5]">{f.phone}</a>
                      <div className="text-[10px] text-gray-400 uppercase">telefono</div>
                    </div>
                  )}
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(f.name + " " + f.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="outline" className="h-9 text-xs">
                  Naviga
                </Button>
              </a>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 flex gap-2 items-start text-xs text-gray-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 11v5m0-8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Dati da Salute Lazio. In emergenza chiama sempre il 112/118.
      </div>
    </div>
  );
}
