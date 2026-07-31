'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { titleCase } from '@/lib/format';
import { useTheme } from '@/hooks/useTheme';

const COLORS = ['#7c3aed','#a78bfa','#06b6d4','#10b981','#f59e0b','#ef4444','#64748b','#3b82f6','#ec4899'];

export default function StatusPieChart({ data = [] }) {
  const { theme } = useTheme();
  const axis    = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltip = theme === 'dark'
    ? { background: '#0f172a', border: '1px solid #1e293b', color: '#f1f5f9' }
    : { background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' };

  const shaped = data.map(d => ({ name: titleCase(d.status), value: Number(d.count) }));
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={shaped} innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
            {shaped.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, ...tooltip }} />
          <Legend wrapperStyle={{ fontSize: 11, color: axis }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
