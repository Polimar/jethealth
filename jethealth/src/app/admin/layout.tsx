import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await requireAdmin())) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="ml-56 px-8 py-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
