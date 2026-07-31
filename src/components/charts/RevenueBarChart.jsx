'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { dateShort } from '@/lib/format';
import { useTheme } from '@/hooks/useTheme';

export default function RevenueBarChart({ data = [] }) {
  const { theme } = useTheme();
  const grid    = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const axis    = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltip = theme === 'dark'
    ? { background: '#0f172a', border: '1px solid #1e293b', color: '#f1f5f9' }
    : { background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' };

  const shaped = data.map(d => ({
    label: dateShort(d.bucket),
    Revenue: Number(d.revenue),
    'Rider payouts': Number(d.rider_payouts),
  }));
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <BarChart data={shaped} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: axis }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: axis }} axisLine={false} tickLine={false} width={40} />
          <Tooltip contentStyle={{ borderRadius: 12, ...tooltip }} />
          <Legend wrapperStyle={{ fontSize: 12, color: axis }} />
          <Bar dataKey="Revenue" fill="#7c3aed" radius={[8,8,0,0]} />
          <Bar dataKey="Rider payouts" fill="#a78bfa" radius={[8,8,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
