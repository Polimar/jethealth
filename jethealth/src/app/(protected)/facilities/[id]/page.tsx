import Link from "next/link";
import { LazioHealthApiService } from "@/lib/lazio-api";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { GuardiaMedicaCard } from "@/components/guardia-medica-card";
import {
  ArrowLeft,
  Navigation,
  Phone,
  Mail,
  Globe,
  MapPin,
  Siren,
} from "lucide-react";

export default async function FacilityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const facility = await LazioHealthApiService.detail(decodeURIComponent(id));

  if (!facility) {
    return (
      <div className="space-y-4">
        <Link
          href="/facilities"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Indietro
        </Link>
        <Card>
          <CardContent className="p-6 text-center text-slate-600">
            Dettagli non disponibili. Puoi consultare{" "}
            <a
              href="https://salutelazio.it"
              className="text-[#0B5FA5] underline"
              target="_blank"
              rel="noreferrer"
            >
              salutelazio.it
            </a>
            .
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/facilities"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Indietro
      </Link>

      <Card>
        <CardContent className="space-y-3 p-5">
          <span className="inline-block rounded-full bg-[#0B5FA5] px-2 py-0.5 text-[10px] font-semibold text-white">
            {facility.typeLabel}
          </span>
          <h1 className="text-2xl font-bold text-slate-900">{facility.name}</h1>
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4" /> {facility.address}
          </p>
          {facility.phone && (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4" /> {facility.phone}
            </p>
          )}
          {facility.email && (
            <p className="flex items-center gap-2 break-all text-sm text-slate-600">
              <Mail className="h-4 w-4" /> {facility.email}
            </p>
          )}
          {facility.website && (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <Globe className="h-4 w-4" />
              <a
                href={facility.website}
                target="_blank"
                rel="noreferrer"
                className="text-[#0B5FA5] underline"
              >
                {facility.website}
              </a>
            </p>
          )}

          {facility.serviceLabels.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700">Servizi</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {facility.serviceLabels.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <a
            href={facility.navUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B5FA5] font-semibold text-white hover:bg-[#094d87]"
          >
            <Navigation className="h-5 w-5" /> Apri navigazione
          </a>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <Siren className="h-5 w-5" />
        In caso di emergenza chiama subito il 112/118.
      </div>

      <GuardiaMedicaCard />
    </div>
  );
}
