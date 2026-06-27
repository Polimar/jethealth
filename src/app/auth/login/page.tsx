"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email o password non corretti"
          : error.message
      );
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#E5E8EE] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#0B5FA5] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M12 3v18M3 12h18" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">JetHealth</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Accedi</h1>
        <p className="text-sm text-gray-500 mb-6">
          Inserisci le tue credenziali per continuare
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-[#0B5FA5] hover:underline"
              >
                Password dimenticata?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
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
            {isLoading ? "Accesso in corso..." : "Accedi"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Non hai un account?{" "}
          <Link href="/auth/register" className="text-[#0B5FA5] font-medium hover:underline">
            Registrati
          </Link>
        </p>
      </Card>
    </div>
  );
}
