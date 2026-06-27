import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("jh_profiles")
    .select("id, name, role, consent_data_storage, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestione Utenti</h1>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Ruolo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Consenso</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Registrazione</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.consent_data_storage ? (
                      <span className="text-green-600">✓ Sì</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(user.created_at).toLocaleDateString("it-IT")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
