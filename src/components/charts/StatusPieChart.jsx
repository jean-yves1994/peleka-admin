'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { titleCase } from '@/lib/format';
import { useTheme } from '@/hooks/useTheme';

const COLORS = [
  '#7c3aed', '#a78bfa', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#64748b', '#3b82f6', '#ec4899',
];

/**
 * Shipments grouped by status.
 *
 * As with the bar chart, the Recharts <Legend> is replaced by an HTML list.
 * Inside a short mobile container the SVG legend overflowed the card — in the
 * screenshot "Pending Payment" was sitting outside the card's bottom edge.
 *
 * The donut also sizes itself from the container rather than using fixed
 * pixel radii, so it stays proportionate from a 375px phone up to desktop.
 */
export default function StatusPieChart({ data = [] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const tooltip = isDark
    ? { background: '#0f172a', border: '1px solid #1e293b', color: '#f1f5f9' }
    : { background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' };

  const shaped = data.map((d, i) => ({
    name: titleCase(d.status),
    value: Number(d.count),
    colour: COLORS[i % COLORS.length],
  }));

  const total = shaped.reduce((sum, d) => sum + d.value, 0);

  if (!total) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-ink-500 dark:text-ink-400">
        No shipments yet
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Donut. min-h-0 stops it squeezing the legend out of the card. */}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={shaped}
              dataKey="value"
              nameKey="name"
              // Percentages scale with the container instead of fixed px radii
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              stroke="none"
            >
              {shaped.map((d) => (
                <Cell key={d.name} fill={d.colour} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 12, fontSize: 12, ...tooltip }}
              formatter={(value, name) => [
                `${value} (${Math.round((value / total) * 100)}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/*
        HTML legend in normal flow. Scrolls if there are many statuses rather
        than growing the card, and each row shows the count so the chart is
        readable without hovering — which you can't do on a phone anyway.
      */}
      <ul className="mt-3 max-h-24 space-y-1.5 overflow-y-auto">
        {shaped.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: d.colour }}
            />
            <span className="min-w-0 flex-1 truncate text-[11px] text-ink-600 dark:text-ink-300">
              {d.name}
            </span>
            <span className="shrink-0 text-[11px] font-medium tabular-nums text-ink-900 dark:text-ink-100">
              {d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
