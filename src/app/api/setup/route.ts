import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY non configurata" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check if admin already exists
  const { data: existing } = await supabase
    .from("jh_profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "Un admin esiste già nel sistema" },
      { status: 409 }
    );
  }

  // Create admin user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: "admin@jethealth.it",
    password: "admin",
    email_confirm: true,
    user_metadata: { name: "Admin", consent_data_storage: true },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // Set admin role
  if (authData.user) {
    await supabase
      .from("jh_profiles")
      .update({ role: "admin" })
      .eq("id", authData.user.id);
  }

  return NextResponse.json({
    message: "Admin creato con successo",
    email: "admin@jethealth.it",
    password: "admin",
  });
}
