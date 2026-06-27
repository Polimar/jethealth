"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setSent(true);
    setIsLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#E5E8EE] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Email inviata</h2>
          <p className="text-sm text-gray-500 mb-6">
            Se l&apos;indirizzo è registrato, riceverai un link per reimpostare la password.
          </p>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">Torna al login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E5E8EE] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Password dimenticata</h1>
        <p className="text-sm text-gray-500 mb-6">
          Inserisci la tua email per ricevere un link di reset.
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
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#0B5FA5] hover:bg-[#094d87] text-white font-semibold"
          >
            {isLoading ? "Invio..." : "Invia link di reset"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link href="/auth/login" className="text-[#0B5FA5] hover:underline">
            Torna al login
          </Link>
        </p>
      </Card>
    </div>
  );
}
