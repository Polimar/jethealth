"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", data.user!.id)
        .single();
      setName(profile?.name ?? "");
    });
  }, []);

  async function saveName() {
    setSavingName(true);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSavingName(false);
    toast[res.ok ? "success" : "error"](
      res.ok ? "Profilo aggiornato" : "Errore nel salvataggio",
    );
  }

  async function changePassword() {
    if (password.length < 8) {
      toast.error("La password deve avere almeno 8 caratteri.");
      return;
    }
    setSavingPwd(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPwd(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password aggiornata");
      setPassword("");
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    const res = await fetch("/api/account", { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      toast.success("Account eliminato");
      router.push("/");
      router.refresh();
    } else {
      toast.error("Eliminazione non riuscita");
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Profilo</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dati personali</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button onClick={saveName} disabled={savingName} className="bg-[#0B5FA5] hover:bg-[#094d87]">
            {savingName ? "Salvataggio…" : "Salva"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cambia password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pwd">Nuova password</Label>
            <Input
              id="pwd"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={changePassword} disabled={savingPwd} variant="outline">
            {savingPwd ? "Aggiornamento…" : "Aggiorna password"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-lg text-red-700">Elimina account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-600">
            L&apos;eliminazione cancella in modo permanente il tuo profilo, lo
            storico dei triage e i feedback.
          </p>
          <Dialog>
            <DialogTrigger render={<Button variant="destructive" />}>
              Elimina il mio account
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confermi l&apos;eliminazione?</DialogTitle>
                <DialogDescription>
                  Questa azione è irreversibile. Tutti i tuoi dati verranno
                  cancellati.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={deleteAccount}
                  disabled={deleting}
                >
                  {deleting ? "Eliminazione…" : "Sì, elimina tutto"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
