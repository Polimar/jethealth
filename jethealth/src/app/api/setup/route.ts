import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = "admin@jethealth.it";
const ADMIN_PASSWORD = "admin";

/**
 * Bootstrap the first admin user. Works ONLY when no admin exists yet.
 * Creates admin@jethealth.it / admin and sets role='admin'.
 */
export async function POST() {
  const admin = createAdminClient();

  const { data: existing, error: checkErr } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1);

  if (checkErr) {
    return NextResponse.json({ error: checkErr.message }, { status: 500 });
  }
  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "Un amministratore esiste già." },
      { status: 409 },
    );
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Amministratore", consent_data_storage: true },
  });

  if (createErr || !created.user) {
    return NextResponse.json(
      { error: createErr?.message ?? "Creazione admin fallita." },
      { status: 500 },
    );
  }

  const { error: roleErr } = await admin
    .from("profiles")
    .update({ role: "admin", name: "Amministratore", consent_data_storage: true })
    .eq("id", created.user.id);

  if (roleErr) {
    return NextResponse.json({ error: roleErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    email: ADMIN_EMAIL,
    message: "Admin creato. Accedi con admin@jethealth.it / admin",
  });
}
