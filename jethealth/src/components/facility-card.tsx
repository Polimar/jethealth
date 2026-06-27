import Link from "next/link";
import { type RankedFacility } from "@/lib/facility-ranking";
import { FACILITY_TYPE_COLORS } from "@/lib/constants/facility-types";
import { Navigation, Phone, ChevronRight } from "lucide-react";

export function FacilityCard({ facility }: { facility: RankedFacility }) {
  const color = FACILITY_TYPE_COLORS[facility.typeCode] ?? "#DC2626";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {facility.typeLabel}
          </span>
          <h3 className="mt-1 truncate font-semibold text-slate-900">
            {facility.name}
          </h3>
          <p className="truncate text-sm text-slate-600">{facility.address}</p>
        </div>
        {facility.distanceKm != null && (
          <span className="flex-shrink-0 text-sm font-semibold text-[#0B5FA5]">
            {facility.distanceKm.toFixed(1)} km
          </span>
        )}
      </div>

      {facility.matchReasons.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          {facility.matchReasons.join(" · ")}
        </p>
      )}
      <p className="mt-1 text-xs text-amber-600">
        Dati attesa non disponibili dall&apos;API pubblica.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={facility.navUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Navigation className="h-4 w-4" /> Naviga
        </a>
        {facility.phone && (
          <a
            href={`tel:${facility.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Phone className="h-4 w-4" /> {facility.phone}
          </a>
        )}
        <Link
          href={`/facilities/${encodeURIComponent(facility.id)}`}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-[#0B5FA5] hover:bg-blue-50"
        >
          Dettagli <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
