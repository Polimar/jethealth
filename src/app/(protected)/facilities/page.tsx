"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

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

const FACILITY_TYPES = [
  { id: "006", label: "Pronto Soccorso", icon: "🏥" },
  { id: "003", label: "Farmacie", icon: "💊" },
  { id: "008", label: "Visite ed esami", icon: "🩺" },
  { id: "009", label: "Studi medici", icon: "👨‍⚕️" },
];

function FacilitiesContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "006";

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState(initialType);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          fetchFacilities(pos.coords.latitude, pos.coords.longitude, activeType);
        },
        () => {
          setUserLocation({ lat: 41.8933, lng: 12.4829 });
          fetchFacilities(41.8933, 12.4829, activeType);
        },
        { timeout: 5000 }
      );
    } else {
      setUserLocation({ lat: 41.8933, lng: 12.4829 });
      fetchFacilities(41.8933, 12.4829, activeType);
    }
  }, []);

  async function fetchFacilities(lat: number, lng: number, type: string) {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/facilities?lat=${lat}&lng=${lng}&type=${type}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setFacilities([]);
      } else {
        setFacilities(data.facilities || []);
      }
    } catch {
      setError("Errore nel caricamento delle strutture");
      setFacilities([]);
    }
    setIsLoading(false);
  }

  function handleTypeChange(type: string) {
    setActiveType(type);
    setSelectedId(null);
    if (userLocation) {
      fetchFacilities(userLocation.lat, userLocation.lng, type);
    }
  }

  const selectedFacility = facilities.find((f) => f.id === selectedId);

  return (
    <div className="-mx-4 -mt-6">
      {/* Full-width map area */}
      <div className="relative">
        {/* Map */}
        <div className="h-[45vh] min-h-[300px] bg-gray-100">
          {userLocation && (
            <MapView
              center={userLocation}
              facilities={facilities}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B5FA5] rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Type filter pills - floating over map bottom */}
        <div className="absolute bottom-3 left-0 right-0 px-4 z-10">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FACILITY_TYPES.map((ft) => (
              <button
                key={ft.id}
                onClick={() => handleTypeChange(ft.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-md transition-all ${
                  activeType === ft.id
                    ? "bg-[#0B5FA5] text-white shadow-[#0B5FA5]/30"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-base">{ft.icon}</span>
                {ft.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected facility detail card (overlaps map) */}
      {selectedFacility && (
        <div className="px-4 -mt-4 relative z-10 mb-4">
          <Card className="p-4 border-[#0B5FA5] shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B5FA5] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {selectedFacility.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900">{selectedFacility.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{selectedFacility.address}</div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-bold text-gray-900">{selectedFacility.distanceKm} km</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-sm text-gray-600">{selectedFacility.eta}′ in auto</span>
                  {selectedFacility.phone && (
                    <>
                      <span className="text-xs text-gray-400">·</span>
                      <a href={`tel:${selectedFacility.phone}`} className="text-sm text-[#0B5FA5] font-medium">
                        {selectedFacility.phone}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedFacility.name + " " + selectedFacility.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full h-10 bg-[#0B5FA5] hover:bg-[#094d87] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 11l18-8-8 18-2-8-8-2z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
                  </svg>
                  Naviga
                </Button>
              </a>
              {selectedFacility.phone && (
                <a href={`tel:${selectedFacility.phone}`} className="flex-1">
                  <Button variant="outline" className="w-full h-10 text-sm rounded-xl">
                    Chiama
                  </Button>
                </a>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* List section */}
      <div className="px-4 pt-4">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {FACILITY_TYPES.find((t) => t.id === activeType)?.label || "Strutture"}
            </h2>
            <p className="text-xs text-gray-500">
              {facilities.length} strutture · ordinate per vicinanza
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#0B5FA5] font-semibold bg-[#EAF2FB] px-2 py-1 rounded-md">
            Dati Salute Lazio
          </div>
        </div>

        {error && (
          <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2.5 pb-6">
          {facilities.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedId(f.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedId === f.id
                  ? "border-[#0B5FA5] bg-[#EAF2FB]/30 shadow-sm"
                  : f.rank === 1
                  ? "border-[#0B5FA5]/30 bg-white shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                  f.rank === 1 ? "bg-[#0B5FA5]" : f.rank <= 3 ? "bg-[#3E7FBE]" : "bg-gray-300"
                }`}>
                  {f.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-[15px]">{f.name}</span>
                    {f.rank === 1 && (
                      <span className="text-[10px] font-bold uppercase text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                        Più vicino
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{f.address}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" stroke="#6b7280" strokeWidth="2" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-900">{f.distanceKm} km</span>
                    </div>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{f.eta}′ in auto</span>
                    {f.phone && (
                      <>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-[#0B5FA5] font-medium">{f.phone}</span>
                      </>
                    )}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-2">
                  <path d="M9 6l6 6-6 6" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          ))}

          {facilities.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Nessuna struttura trovata in quest&apos;area.</p>
            </div>
          )}
        </div>

        {/* Emergency reminder */}
        <div className="flex gap-2 items-start text-xs text-gray-400 pb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 11v5m0-8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Dati da Salute Lazio. In emergenza chiama sempre il 112/118.
        </div>
      </div>
    </div>
  );
}

export default function FacilitiesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B5FA5] rounded-full animate-spin" /></div>}>
      <FacilitiesContent />
    </Suspense>
  );
}
