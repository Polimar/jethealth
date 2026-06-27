"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("La password deve avere almeno 8 caratteri.");
      return;
    }
    if (password !== confirm) {
      toast.error("Le password non coincidono.");
      return;
    }
    if (!consent) {
      toast.error("Devi acconsentire al trattamento dei dati per registrarti.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, consent_data_storage: true },
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Registrazione non riuscita: " + error.message);
      return;
    }
    if (data.session) {
      toast.success("Account creato");
      router.push("/dashboard");
      router.refresh();
    } else {
      setNeedsVerification(true);
    }
  }

  if (needsVerification) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#0B5FA5]">
            <MailCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Controlla la tua email</CardTitle>
          <CardDescription>
            Ti abbiamo inviato un link per verificare l&apos;account{" "}
            <span className="font-medium">{email}</span>. Clicca sul link per
            attivare l&apos;accesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Torna al login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Crea un account</CardTitle>
        <CardDescription>
          Registrati per analizzare i tuoi sintomi in modo sicuro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password (min. 8 caratteri)</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Conferma password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <Checkbox
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              className="mt-0.5"
            />
            <span>
              Acconsento al trattamento dei miei dati sanitari come descritto
              nell&apos;informativa privacy.
            </span>
          </label>
          <Button
            type="submit"
            className="w-full bg-[#0B5FA5] hover:bg-[#094d87]"
            disabled={loading}
          >
            {loading ? "Creazione…" : "Registrati"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Hai già un account?{" "}
          <Link href="/auth/login" className="text-[#0B5FA5] hover:underline">
            Accedi
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
