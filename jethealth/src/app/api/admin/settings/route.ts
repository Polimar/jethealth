import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { invalidateSettingsCache } from "@/lib/settings";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .order("category");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as {
    updates?: Array<{ key: string; value: string }>;
  } | null;
  if (!body?.updates?.length) {
    return NextResponse.json({ error: "Nessun aggiornamento" }, { status: 400 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  for (const u of body.updates) {
    const { error } = await supabase
      .from("app_settings")
      .update({ value: u.value, updated_at: new Date().toISOString(), updated_by: user?.id })
      .eq("key", u.key);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  invalidateSettingsCache();
  return NextResponse.json({ ok: true });
}
