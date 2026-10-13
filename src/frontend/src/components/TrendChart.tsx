import type { DailyTrendPoint } from "@/backend";
import { formatTanggal } from "@/lib/format";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendChartProps {
  data: DailyTrendPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  const chartData = data.map((point) => ({
    date: point.date,
    label: formatTanggal(point.date),
    surplus: Number(point.surplus),
    shortfall: Number(point.shortfall),
  }));

  return (
    <div
      data-ocid="ringkasan.trend_chart"
      className="h-80 w-full rounded-xl border border-border bg-card p-4 shadow-subtle"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "oklch(var(--muted-foreground))" }}
            stroke="oklch(var(--border))"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "oklch(var(--muted-foreground))" }}
            stroke="oklch(var(--border))"
          />
          <Tooltip
            contentStyle={{
              background: "oklch(var(--popover))",
              border: "1px solid oklch(var(--border))",
              borderRadius: "0.75rem",
              color: "oklch(var(--popover-foreground))",
              fontSize: "0.8rem",
            }}
            formatter={(value, name) => [
              `${String(value)} porsi`,
              name === "surplus" ? "Kelebihan" : "Kekurangan",
            ]}
          />
          <Legend
            formatter={(value) =>
              value === "surplus" ? "Kelebihan" : "Kekurangan"
            }
            wrapperStyle={{ fontSize: "0.8rem" }}
          />
          <Bar
            dataKey="surplus"
            fill="oklch(var(--success))"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="shortfall"
            fill="oklch(var(--destructive))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
