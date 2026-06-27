import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth-helpers";
import { AppNav } from "@/components/app-nav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav isAdmin={profile.role === "admin"} />
      <main className="px-4 pb-24 pt-6 md:ml-60 md:px-8 md:pb-8">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
