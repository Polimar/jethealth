"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const URGENCY_COLORS: Record<string, string> = {
  low: "#16A34A",
  medium: "#CA8A04",
  high: "#EA580C",
  emergency: "#DC2626",
};

const URGENCY_LABEL: Record<string, string> = {
  low: "Bassa",
  medium: "Media",
  high: "Alta",
  emergency: "Emergenza",
};

export function UrgencyPie({
  data,
}: {
  data: { level: string; count: number }[];
}) {
  if (!data.length)
    return <p className="py-10 text-center text-sm text-slate-400">Nessun dato</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="level"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(e: { name?: string | number }) =>
            URGENCY_LABEL[String(e.name)] ?? String(e.name)
          }
        >
          {data.map((d) => (
            <Cell key={d.level} fill={URGENCY_COLORS[d.level] ?? "#94A3B8"} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v, n) => [v as number, URGENCY_LABEL[String(n)] ?? String(n)]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="date" fontSize={11} />
        <YAxis allowDecimals={false} fontSize={11} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#0B5FA5"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function FeedbackBar({
  data,
}: {
  data: { rating: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="rating" fontSize={11} />
        <YAxis allowDecimals={false} fontSize={11} />
        <Tooltip />
        <Bar dataKey="count" fill="#0B5FA5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
