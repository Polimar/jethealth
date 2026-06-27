import { createAdminClient } from "./supabase/admin";

type SettingsMap = Record<string, string>;

let cache: { data: SettingsMap; at: number } | null = null;
const TTL_MS = 60_000;

const DEFAULTS: SettingsMap = {
  openai_model: "gpt-4o",
  openai_max_tokens: "1200",
  openai_system_prompt: "",
  lazio_api_base_url:
    "https://server.salutelazio.it/server/external-services/facilities/structures",
  facilities_default_radius_km: "8",
  disclaimer_text:
    "JetHealth non sostituisce il parere di un medico. In caso di emergenza o peggioramento rapido, chiama subito il 112/118.",
};

/** Reads app settings from Supabase with a 60s in-memory cache. */
export async function getSettings(): Promise<SettingsMap> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("app_settings").select("key, value");
    const map: SettingsMap = { ...DEFAULTS };
    for (const row of data ?? []) {
      if (row.value != null) map[row.key] = row.value;
    }
    cache = { data: map, at: Date.now() };
    return map;
  } catch {
    return { ...DEFAULTS };
  }
}

export async function getSetting(key: string): Promise<string> {
  const s = await getSettings();
  return s[key] ?? DEFAULTS[key] ?? "";
}

export function invalidateSettingsCache() {
  cache = null;
}
