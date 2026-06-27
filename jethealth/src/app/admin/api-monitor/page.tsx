"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Log = {
  id: string;
  service: string;
  endpoint: string | null;
  method: string | null;
  status_code: number | null;
  response_time_ms: number | null;
  tokens_used: number | null;
  error_message: string | null;
  created_at: string;
};

type Summary = {
  total: number;
  successRate: number;
  avgTimeMs: number;
  tokensToday: number;
};

export default function ApiMonitorPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [service, setService] = useState("all");
  const [status, setStatus] = useState("all");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (service !== "all") params.set("service", service);
    if (status !== "all") params.set("status", status);
    const res = await fetch(`/api/admin/api-logs?${params}`);
    const d = await res.json();
    setLogs(d.logs ?? []);
    setSummary(d.summary ?? null);
  }, [service, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const cards = summary
    ? [
        { label: "Chiamate oggi", value: summary.total },
        { label: "Success rate", value: `${summary.successRate}%` },
        { label: "Tempo medio", value: `${summary.avgTimeMs} ms` },
        { label: "Token OpenAI oggi", value: summary.tokensToday },
      ]
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Monitor API</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="mt-1 text-xs text-slate-500">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Select value={service} onValueChange={(v) => setService(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Servizio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i servizi</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="salute_lazio">Salute Lazio</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="success">Successo</SelectItem>
            <SelectItem value="error">Errore</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servizio</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tempo</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                    Nessun log.
                  </TableCell>
                </TableRow>
              )}
              {logs.map((l) => {
                const ok = l.status_code && l.status_code >= 200 && l.status_code < 400;
                return (
                  <TableRow key={l.id}>
                    <TableCell>{l.service}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {l.endpoint}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ok ? "outline" : "destructive"}>
                        {l.status_code ?? "err"}
                      </Badge>
                    </TableCell>
                    <TableCell>{l.response_time_ms ?? "—"} ms</TableCell>
                    <TableCell>{l.tokens_used ?? "—"}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(l.created_at).toLocaleString("it-IT")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
