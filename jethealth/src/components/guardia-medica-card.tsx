import { GUARDIA_MEDICA } from "@/lib/constants/guardia-medica";
import { Phone } from "lucide-react";

export function GuardiaMedicaCard() {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
      <h3 className="font-semibold text-slate-900">
        Continuità assistenziale (Guardia medica)
      </h3>
      <p className="mt-1 text-sm text-slate-600">{GUARDIA_MEDICA.orari}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={`tel:${GUARDIA_MEDICA.numeroUnico}`}
          className="inline-flex items-center gap-1 rounded-lg bg-[#0B5FA5] px-3 py-1.5 text-sm font-semibold text-white"
        >
          <Phone className="h-4 w-4" /> {GUARDIA_MEDICA.numeroUnico}
        </a>
        <a
          href={`tel:${GUARDIA_MEDICA.emergenza}`}
          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
        >
          <Phone className="h-4 w-4" /> Emergenza {GUARDIA_MEDICA.emergenza}
        </a>
      </div>
    </div>
  );
}
