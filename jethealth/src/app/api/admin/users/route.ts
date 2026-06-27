import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const admin = createAdminClient();
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, name, role, consent_data_storage, disabled, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map(authData.users.map((u) => [u.id, u.email]));
  const confirmedById = new Map(
    authData.users.map((u) => [u.id, !!u.email_confirmed_at]),
  );

  const users = (profiles ?? []).map((p) => ({
    ...p,
    email: emailById.get(p.id) ?? null,
    email_confirmed: confirmedById.get(p.id) ?? false,
  }));
  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as {
    userId?: string;
    action?: "disable" | "enable" | "promote" | "demote" | "delete";
  } | null;
  if (!body?.userId || !body.action) {
    return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });
  }
  const admin = createAdminClient();
  const { userId, action } = body;

  switch (action) {
    case "disable":
      await admin.from("profiles").update({ disabled: true }).eq("id", userId);
      await admin.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
      break;
    case "enable":
      await admin.from("profiles").update({ disabled: false }).eq("id", userId);
      await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
      break;
    case "promote":
      await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
      break;
    case "demote":
      await admin.from("profiles").update({ role: "user" }).eq("id", userId);
      break;
    case "delete":
      await admin.auth.admin.deleteUser(userId);
      break;
    default:
      return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
