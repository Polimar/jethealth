import { type UrgencyLevel } from "@/lib/triage-schema";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, AlertTriangle, Siren } from "lucide-react";

const CONFIG: Record<
  UrgencyLevel,
  { label: string; className: string; icon: React.ElementType }
> = {
  low: {
    label: "Bassa urgenza",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  },
  medium: {
    label: "Media urgenza",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: AlertCircle,
  },
  high: {
    label: "Alta urgenza",
    className: "bg-orange-100 text-orange-800 border-orange-200",
    icon: AlertTriangle,
  },
  emergency: {
    label: "Emergenza",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: Siren,
  },
};

export function UrgencyBadge({
  level,
  size = "md",
}: {
  level: UrgencyLevel;
  size?: "md" | "lg";
}) {
  const c = CONFIG[level];
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-semibold",
        c.className,
        size === "lg" ? "px-4 py-2 text-base" : "px-3 py-1 text-sm",
      )}
    >
      <Icon className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      {c.label}
    </span>
  );
}
