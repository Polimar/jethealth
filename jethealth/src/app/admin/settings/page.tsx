"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Setting = {
  key: string;
  value: string;
  category: string;
  description: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  ai: "Configurazione AI",
  facilities: "Configurazione strutture",
  general: "Generale",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings ?? []))
      .finally(() => setLoading(false));
  }, []);

  function update(key: string, value: string) {
    setSettings((s) => s.map((x) => (x.key === key ? { ...x, value } : x)));
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        updates: settings.map((s) => ({ key: s.key, value: s.value })),
      }),
    });
    setSaving(false);
    toast[res.ok ? "success" : "error"](
      res.ok ? "Impostazioni salvate" : "Errore nel salvataggio",
    );
  }

  if (loading) return <p className="text-slate-500">Caricamento…</p>;

  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Impostazioni</h1>
        <Button onClick={save} disabled={saving} className="bg-[#0B5FA5] hover:bg-[#094d87]">
          {saving ? "Salvataggio…" : "Salva modifiche"}
        </Button>
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle className="text-base">
              {CATEGORY_LABEL[cat] ?? cat}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((s) => (
              <div key={s.key} className="space-y-1.5">
                <Label htmlFor={s.key}>{s.description || s.key}</Label>
                {s.key.includes("prompt") || s.key.includes("disclaimer") ? (
                  <Textarea
                    id={s.key}
                    rows={4}
                    value={s.value}
                    onChange={(e) => update(s.key, e.target.value)}
                  />
                ) : (
                  <Input
                    id={s.key}
                    value={s.value}
                    onChange={(e) => update(s.key, e.target.value)}
                  />
                )}
                <p className="text-xs text-slate-400">{s.key}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
