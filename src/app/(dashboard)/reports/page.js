'use client';
import { useEffect, useState } from 'react';
import { Calendar, Download, DollarSign, TrendingUp, Users, Clock, Star } from 'lucide-react';
import TopBar from '@/components/TopBar';
import StatCard from '@/components/StatCard';
import RevenueBarChart from '@/components/charts/RevenueBarChart';
import StatusPieChart from '@/components/charts/StatusPieChart';
import { api } from '@/lib/api';
import { money, num } from '@/lib/format';

const today = new Date().toISOString().slice(0,10);
const monthAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().slice(0,10);

export default function ReportsPage() {
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [groupBy, setGroupBy] = useState('day');
  const [revenue, setRevenue] = useState([]);
  const [deliveries, setDeliveries] = useState(null);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const q = `?from=${from}&to=${to}`;
      const [rev, del, rid] = await Promise.all([
        api.get(`/api/admin/reports/revenue${q}&groupBy=${groupBy}`),
        api.get(`/api/admin/reports/deliveries${q}`),
        api.get(`/api/admin/reports/riders${q}`),
      ]);
      setRevenue(rev.data); setDeliveries(del.data); setRiders(rid.data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const totals = revenue.reduce((acc, r) => {
    acc.revenue += Number(r.revenue || 0);
    acc.payouts += Number(r.rider_payouts || 0);
    acc.deliveries += Number(r.deliveries || 0);
    return acc;
  }, { revenue: 0, payouts: 0, deliveries: 0 });

  const exportCsv = () => {
    const header = ['Bucket','Deliveries','Revenue','Rider payouts','Tax','Currency'];
    const rows = revenue.map(r => [r.bucket, r.deliveries, r.revenue, r.rider_payouts, r.tax_collected, r.currency]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `revenue-${from}-to-${to}.csv`; a.click();
  };

  return (
    <>
      <TopBar title="Reports" subtitle="Revenue, delivery performance, and rider leaderboard." />
      <div className="px-8 py-6 space-y-6">
        <div className="card p-4 flex flex-wrap items-end gap-3">
          <div><label className="label">From</label><input type="date" className="input" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div><label className="label">To</label><input type="date" className="input" value={to} onChange={e => setTo(e.target.value)} /></div>
          <div><label className="label">Group by</label>
            <select className="input" value={groupBy} onChange={e => setGroupBy(e.target.value)}>
              <option value="day">Day</option><option value="week">Week</option><option value="month">Month</option>
            </select></div>
          <button onClick={load} className="btn btn-primary"><Calendar className="w-4 h-4" /> Apply</button>
          <button onClick={exportCsv} className="btn btn-outline"><Download className="w-4 h-4" /> Export CSV</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total revenue" value={money(totals.revenue)} icon={DollarSign} tone="brand" />
          <StatCard label="Rider payouts" value={money(totals.payouts)} icon={Users} tone="sky" />
          <StatCard label="Deliveries" value={num(totals.deliveries)} icon={TrendingUp} tone="emerald" />
          <StatCard label="Avg delivery time"
            value={deliveries?.delivery_time_stats?.avg_minutes_assigned_to_delivered ? `${Number(deliveries.delivery_time_stats.avg_minutes_assigned_to_delivered).toFixed(0)} min` : '—'}
            sub="From assign to delivered" icon={Clock} tone="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-6 lg:col-span-2">
            <h3 className="font-semibold mb-4">Revenue over time</h3>
            {loading ? <div className="text-sm text-ink-500 dark:text-ink-400">Loading…</div> : <RevenueBarChart data={revenue} />}
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-2">Shipments by status</h3>
            {deliveries?.by_status && <StatusPieChart data={deliveries.by_status} />}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-ink-100 dark:border-ink-800">
            <h3 className="font-semibold">Rider leaderboard</h3>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">Top performers in the selected period</p>
          </div>
          <table className="table w-full">
            <thead><tr><th>Rank</th><th>Rider</th><th className="text-right">Deliveries</th><th className="text-right">Earnings</th><th>Rating</th></tr></thead>
            <tbody>
              {riders.map((r, i) => (
                <tr key={r.id}>
                  <td className="font-semibold text-ink-500 dark:text-ink-400">#{i+1}</td>
                  <td>
                    <div className="font-medium">{r.full_name}</div>
                    <div className="text-xs text-ink-500 dark:text-ink-400">{r.email || r.phone}</div>
                  </td>
                  <td className="text-right font-medium tabular-nums">{num(r.deliveries)}</td>
                  <td className="text-right font-medium tabular-nums">{money(r.earnings)}</td>
                  <td><span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{Number(r.rating_avg || 0).toFixed(2)}</span></td>
                </tr>
              ))}
              {riders.length === 0 && <tr><td colSpan="5" className="p-6 text-sm text-ink-500 dark:text-ink-400 text-center">No deliveries in the selected period.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
