import { Phone, Siren } from "lucide-react";

export function EmergencyBanner({ redFlags }: { redFlags?: string[] }) {
  return (
    <div className="rounded-xl border-2 border-red-300 bg-red-50 p-5">
      <div className="flex items-center gap-3 text-red-700">
        <Siren className="h-7 w-7 animate-pulse" />
        <h2 className="text-xl font-bold">Potrebbe essere un&apos;emergenza</h2>
      </div>
      <p className="mt-2 text-sm text-red-800">
        Dai sintomi indicati emergono segnali che richiedono assistenza
        immediata. Chiama subito il 112/118. Non metterti alla guida da solo se
        hai sintomi gravi.
      </p>
      {redFlags && redFlags.length > 0 && (
        <ul className="mt-3 list-inside list-disc text-sm text-red-800">
          {redFlags.map((rf) => (
            <li key={rf}>{rf}</li>
          ))}
        </ul>
      )}
      <a
        href="tel:112"
        className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-lg font-bold text-white shadow-lg transition hover:bg-red-700"
      >
        <Phone className="h-6 w-6" />
        Chiama il 112
      </a>
    </div>
  );
}
