"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Recupera password</CardTitle>
        <CardDescription>
          {sent
            ? "Se l'email è registrata, riceverai un link per reimpostare la password."
            : "Inserisci la tua email per ricevere il link di reset."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!sent && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#0B5FA5] hover:bg-[#094d87]"
              disabled={loading}
            >
              {loading ? "Invio…" : "Invia link di reset"}
            </Button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-slate-600">
          <Link href="/auth/login" className="text-[#0B5FA5] hover:underline">
            Torna al login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
