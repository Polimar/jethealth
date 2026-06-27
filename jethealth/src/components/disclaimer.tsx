import { Info } from "lucide-react";

export function Disclaimer({ text }: { text?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-900">
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>
        {text ??
          "JetHealth non sostituisce il parere di un medico. In caso di emergenza o peggioramento rapido, chiama subito il 112/118."}
      </span>
    </div>
  );
}
