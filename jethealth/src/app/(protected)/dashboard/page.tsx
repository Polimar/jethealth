import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Disclaimer } from "@/components/disclaimer";
import { Stethoscope, MapPin, History, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user?.id ?? "")
    .single();
  const metaName =
    (user?.user_metadata?.name as string | undefined) ?? "";
  const fullName = profile?.name?.trim() || metaName.trim();
  const firstName =
    fullName.split(" ")[0] || user?.email?.split("@")[0] || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Ciao{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="mt-1 text-slate-600">
          Come possiamo aiutarti oggi?
        </p>
      </div>

      <Link href="/triage" className="block">
        <div className="rounded-2xl bg-gradient-to-br from-[#0C5399] to-[#083D74] p-6 text-white shadow-md transition hover:shadow-lg">
          <Stethoscope className="h-8 w-8" />
          <h2 className="mt-3 text-xl font-bold">Analizza i miei sintomi</h2>
          <p className="mt-1 text-sm text-white/80">
            Rispondi a poche domande e scopri il percorso sanitario più adatto.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
            Inizia il triage <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <MapPin className="h-6 w-6 text-[#0B5FA5]" />
            <h3 className="mt-3 font-semibold text-slate-900">
              Trova una struttura
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Pronto soccorso, ambulatori e farmacie vicino a te.
            </p>
            <Link
              href="/facilities"
              className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full")}
            >
              Apri la mappa
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <History className="h-6 w-6 text-[#0B5FA5]" />
            <h3 className="mt-3 font-semibold text-slate-900">
              Cronologia triage
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Rivedi le tue valutazioni precedenti.
            </p>
            <Link
              href="/history"
              className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full")}
            >
              Vedi cronologia
            </Link>
          </CardContent>
        </Card>
      </div>

      <Disclaimer />
    </div>
  );
}
