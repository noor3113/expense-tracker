import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORY_META } from "./categories";
import { formatMoney, type Category } from "@/lib/expenses";

function TooltipBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-sm shadow-[var(--shadow-card)]">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-popover-foreground">{formatMoney(value)}</p>
    </div>
  );
}

export function CategoryDonut({
  data,
}: {
  data: { category: Category; amount: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            innerRadius="58%"
            outerRadius="88%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.category} fill={CATEGORY_META[d.category].color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TooltipBox
                  label={String(payload[0]?.name ?? "")}
                  value={Number(payload[0]?.value ?? 0)}
                />
              ) : null
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailyBars({ data }: { data: { day: number; amount: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            interval={4}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <TooltipBox label={`Day ${label}`} value={Number(payload[0]?.value ?? 0)} />
              ) : null
            }
          />
          <Bar dataKey="amount" fill="var(--primary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
