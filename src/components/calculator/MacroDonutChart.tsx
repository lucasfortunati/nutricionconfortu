"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

export interface MacroDonutDatum {
  key: "protein" | "fat" | "carb";
  name: string;
  grams: number;
  kcal: number;
  pct: number;
}

const SERIES_VAR: Record<MacroDonutDatum["key"], string> = {
  protein: "var(--series-1)",
  fat: "var(--series-2)",
  carb: "var(--series-3)",
};

function formatKcal(value: number): string {
  return `${Math.round(value)} kcal`;
}

export function MacroDonutChart({ data }: { data: MacroDonutDatum[] }) {
  return (
    <div className="viz-root">
      <style>{`
        .viz-root {
          --surface-1: #fcfcfb;
          --text-secondary: #52514e;
          --series-1: #2a78d6;
          --series-2: #eb6834;
          --series-3: #1baf7a;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .viz-root {
            --surface-1: #1a1a19;
            --text-secondary: #c3c2b7;
            --series-1: #3987e5;
            --series-2: #d95926;
            --series-3: #199e70;
          }
        }
        :root[data-theme="dark"] .viz-root {
          --surface-1: #1a1a19;
          --text-secondary: #c3c2b7;
          --series-1: #3987e5;
          --series-2: #d95926;
          --series-3: #199e70;
        }
      `}</style>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              data={data}
              dataKey="kcal"
              nameKey="name"
              cx="50%"
              cy="42%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              stroke="var(--surface-1)"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={SERIES_VAR[entry.key]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => {
                const pct = (props.payload as MacroDonutDatum).pct;
                return [`${formatKcal(Number(value))} (${pct.toFixed(0)}%)`, name];
              }}
              contentStyle={{ fontSize: 13 }}
            />
            <Legend
              verticalAlign="bottom"
              height={56}
              formatter={(value, entry) => {
                const payload = entry.payload as unknown as MacroDonutDatum;
                return (
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {value} · {Math.round(payload.grams)}g ({payload.pct.toFixed(0)}%)
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
