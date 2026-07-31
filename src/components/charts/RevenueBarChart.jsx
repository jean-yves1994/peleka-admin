'use client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { dateShort } from '@/lib/format';
import { useTheme } from '@/hooks/useTheme';

const SERIES = [
  { key: 'Revenue',        colour: '#7c3aed' },
  { key: 'Rider payouts',  colour: '#a78bfa' },
];

/**
 * Revenue vs rider payouts.
 *
 * The Recharts <Legend> is deliberately NOT used. It renders as an absolutely
 * positioned HTML div layered over the chart, and on a short mobile container
 * it escaped the card and overlapped the card below it. A plain HTML legend
 * sits in normal document flow, so it can never overflow.
 */
export default function RevenueBarChart({ data = [] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const grid = isDark ? '#1e293b' : '#e2e8f0';
  const axis = isDark ? '#94a3b8' : '#64748b';
  const tooltip = isDark
    ? { background: '#0f172a', border: '1px solid #1e293b', color: '#f1f5f9' }
    : { background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' };

  const shaped = data.map((d) => ({
    label: dateShort(d.bucket),
    Revenue: Number(d.revenue),
    'Rider payouts': Number(d.rider_payouts),
  }));

  if (!shaped.length) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-ink-500 dark:text-ink-400">
        No revenue in this period
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* HTML legend — in normal flow, so it can't escape the card */}
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: s.colour }}
            />
            <span className="text-[11px] text-ink-500 dark:text-ink-400">{s.key}</span>
          </span>
        ))}
      </div>

      {/* min-h-0 lets this flex child shrink instead of pushing the legend out */}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={shaped} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: axis }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              tick={{ fontSize: 10, fill: axis }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, fontSize: 12, ...tooltip }}
              cursor={{ fill: isDark ? '#1e293b55' : '#f1f5f955' }}
            />
            {SERIES.map((s) => (
              <Bar key={s.key} dataKey={s.key} fill={s.colour} radius={[6, 6, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
