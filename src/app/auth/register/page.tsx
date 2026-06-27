"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }
    if (password.length < 8) {
      setError("La password deve essere di almeno 8 caratteri");
      return;
    }
    if (!consent) {
      setError("Devi acconsentire al trattamento dei dati per continuare");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          consent_data_storage: true,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#E5E8EE] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Controlla la tua email</h2>
          <p className="text-sm text-gray-500 mb-6">
            Abbiamo inviato un link di verifica a <strong>{email}</strong>.
            Clicca sul link per attivare il tuo account.
          </p>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">Torna al login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E5E8EE] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#0B5FA5] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M12 3v18M3 12h18" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">JetHealth</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Registrati</h1>
        <p className="text-sm text-gray-500 mb-6">
          Crea un account per usare JetHealth
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Il tuo nome"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@esempio.it"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 8 caratteri"
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Conferma password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ripeti la password"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0B5FA5] focus:ring-[#0B5FA5]"
            />
            <label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
              Acconsento al trattamento dei miei dati sanitari come descritto
              nell&apos;informativa privacy per ricevere un orientamento sanitario.
            </label>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#0B5FA5] hover:bg-[#094d87] text-white font-semibold"
          >
            {isLoading ? "Registrazione..." : "Registrati"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Hai già un account?{" "}
          <Link href="/auth/login" className="text-[#0B5FA5] font-medium hover:underline">
            Accedi
          </Link>
        </p>
      </Card>
    </div>
  );
}
