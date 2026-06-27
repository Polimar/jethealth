"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Setting {
  id: number;
  key: string;
  value: string;
  category: string;
  description: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const supabase = createClient();
    const { data } = await supabase
      .from("jh_app_settings")
      .select("*")
      .order("category");
    setSettings(data || []);
    setIsLoading(false);
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  }

  async function handleSave() {
    setIsSaving(true);
    const supabase = createClient();

    for (const setting of settings) {
      await supabase
        .from("jh_app_settings")
        .update({ value: setting.value })
        .eq("key", setting.key);
    }

    setIsSaving(false);
  }

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Caricamento...</div>;
  }

  const groups = settings.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, Setting[]>);

  const categoryLabels: Record<string, string> = {
    ai: "Configurazione AI",
    facilities: "Configurazione Strutture",
    general: "Generale",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Salvataggio..." : "Salva modifiche"}
        </Button>
      </div>

      {Object.entries(groups).map(([category, categorySettings]) => (
        <Card key={category} className="p-6 mb-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
            {categoryLabels[category] || category}
          </h2>
          <div className="space-y-4">
            {categorySettings.map((setting) => (
              <div key={setting.key}>
                <Label htmlFor={setting.key} className="text-sm font-medium">
                  {setting.description || setting.key}
                </Label>
                {setting.key === "disclaimer_text" || setting.value.length > 100 ? (
                  <Textarea
                    id={setting.key}
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <Input
                    id={setting.key}
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    className="mt-1"
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
