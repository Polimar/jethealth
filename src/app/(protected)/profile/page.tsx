"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");
      const { data: profile } = await supabase
        .from("jh_profiles")
        .select("name")
        .eq("id", user.id)
        .single();
      setName(profile?.name || "");
      setIsLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("jh_profiles").update({ name }).eq("id", user.id);
    setMessage("Profilo aggiornato");
    setIsSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleDeleteAccount() {
    if (!confirm("Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.")) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Delete user data
    await supabase.from("jh_feedback").delete().eq("user_id", user.id);
    await supabase.from("jh_triage_history").delete().eq("user_id", user.id);
    await supabase.from("jh_profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Caricamento...</div>;
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Profilo</h1>

      <Card className="p-6 mb-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              disabled
              className="mt-1 bg-gray-50"
            />
          </div>

          {message && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
              {message}
            </div>
          )}

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Salvataggio..." : "Salva modifiche"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Azioni account</h2>
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={handleLogout}>
            Esci dall&apos;account
          </Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleDeleteAccount}
          >
            Elimina account e dati
          </Button>
        </div>
      </Card>
    </div>
  );
}
