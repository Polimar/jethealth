"use client";

import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { type RankedFacility } from "@/lib/facility-ranking";
import { FACILITY_TYPE_COLORS } from "@/lib/constants/facility-types";

export default function FacilityMap({
  center,
  facilities,
}: {
  center: { lat: number; lng: number };
  facilities: RankedFacility[];
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[center.lat, center.lng]}
        radius={8}
        pathOptions={{ color: "#0B5FA5", fillColor: "#0B5FA5", fillOpacity: 0.9 }}
      >
        <Popup>La tua posizione</Popup>
      </CircleMarker>
      {facilities.map((f) =>
        f.latitude && f.longitude ? (
          <CircleMarker
            key={f.id}
            center={[f.latitude, f.longitude]}
            radius={9}
            pathOptions={{
              color: FACILITY_TYPE_COLORS[f.typeCode] ?? "#DC2626",
              fillColor: FACILITY_TYPE_COLORS[f.typeCode] ?? "#DC2626",
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <strong>{f.name}</strong>
              <br />
              {f.address}
              {f.distanceKm != null && (
                <>
                  <br />
                  <span>{f.distanceKm.toFixed(1)} km</span>
                </>
              )}
            </Popup>
          </CircleMarker>
        ) : null,
      )}
    </MapContainer>
  );
}
