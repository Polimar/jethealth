"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Facility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rank: number;
  address: string;
}

interface MapViewProps {
  center: { lat: number; lng: number };
  facilities: Facility[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function createMarkerIcon(rank: number, isSelected: boolean) {
  const color = isSelected ? "#C8312B" : rank === 1 ? "#0B5FA5" : rank <= 3 ? "#3E7FBE" : "#8AA4BE";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);transform:rotate(-45deg);"><span style="transform:rotate(45deg)">${rank}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

function createUserIcon() {
  return L.divIcon({
    className: "user-marker",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#0B5FA5;border:3px solid #fff;box-shadow:0 0 0 4px rgba(11,95,165,.25);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function FlyTo({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], 12, { duration: 1 });
  }, [center, map]);
  return null;
}

export default function MapView({ center, facilities, selectedId, onSelect }: MapViewProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo center={center} />
      <Marker position={[center.lat, center.lng]} icon={createUserIcon()}>
        <Popup>La tua posizione</Popup>
      </Marker>
      {facilities
        .filter((f) => f.lat !== 0 && f.lng !== 0)
        .map((f) => (
          <Marker
            key={f.id}
            position={[f.lat, f.lng]}
            icon={createMarkerIcon(f.rank, f.id === selectedId)}
            eventHandlers={{ click: () => onSelect(f.id) }}
          >
            <Popup>
              <strong>{f.name}</strong><br />
              {f.address}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
