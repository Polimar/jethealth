"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  disabled: boolean;
  email_confirmed: boolean;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    const d = await res.json();
    setUsers(d.users ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function action(
    userId: string,
    act: "disable" | "enable" | "promote" | "demote" | "delete",
  ) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: act }),
    });
    if (res.ok) {
      toast.success("Operazione completata");
      load();
    } else {
      toast.error("Operazione non riuscita");
    }
  }

  if (loading) return <p className="text-slate-500">Caricamento…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Gestione utenti</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Registrato</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name || "—"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.disabled ? (
                      <Badge variant="destructive">Disabilitato</Badge>
                    ) : (
                      <Badge variant="outline">Attivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(u.created_at).toLocaleDateString("it-IT")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" />}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {u.disabled ? (
                          <DropdownMenuItem onClick={() => action(u.id, "enable")}>
                            Riabilita
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => action(u.id, "disable")}>
                            Disabilita
                          </DropdownMenuItem>
                        )}
                        {u.role === "admin" ? (
                          <DropdownMenuItem onClick={() => action(u.id, "demote")}>
                            Declassa a utente
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => action(u.id, "promote")}>
                            Promuovi ad admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => action(u.id, "delete")}
                        >
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
