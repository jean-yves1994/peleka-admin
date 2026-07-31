'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, TrendingUp, Users, DollarSign, ArrowUpRight } from 'lucide-react';
import TopBar from '@/components/TopBar';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import { ShipmentBadge } from '@/components/Badge';
import RevenueBarChart from '@/components/charts/RevenueBarChart';
import StatusPieChart from '@/components/charts/StatusPieChart';
import { api } from '@/lib/api';
import { money, num, relative, CITY } from '@/lib/format';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const to = new Date().toISOString().slice(0, 10);
        const [dash, rev] = await Promise.all([
          api.get('/api/admin/dashboard'),
          api.get(`/api/admin/reports/revenue?from=${from}&to=${to}&groupBy=day`),
        ]);
        setData(dash.data);
        setRevenue(rev.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const recentColumns = [
    {
      key: 'tracking_number',
      label: 'Tracking',
      primary: true,
      render: (s) => (
        <Link
          href={`/shipments/${s.id}`}
          onClick={(e) => e.stopPropagation()}
          className="link font-medium"
        >
          {s.tracking_number}
        </Link>
      ),
    },
    { key: 'status', label: 'Status', render: (s) => <ShipmentBadge status={s.status} /> },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (s) => money(s.total_price, s.currency),
      className: 'tabular-nums',
    },
    {
      key: 'created',
      label: 'Created',
      render: (s) => relative(s.created_at),
      className: 'text-ink-500 dark:text-ink-400',
    },
  ];

  return (
    <>
      <TopBar title="Dashboard" subtitle={`Overview of today's operations in ${CITY.name}.`} />

      {/* Page padding scales with the viewport instead of a flat px-8 */}
      <div className="space-y-4 px-4 py-5 sm:px-6 lg:space-y-6 lg:px-8 lg:py-6">
        {loading ? (
          <div className="text-sm text-ink-500 dark:text-ink-400">Loading…</div>
        ) : !data ? (
          <div className="text-sm text-rose-600">Failed to load dashboard.</div>
        ) : (
          <>
            {/*
              KPI grid. Starts at ONE column — two 130px cards side by side is
              what produced the overlapping text in the screenshot.
                <  640px : 1 column
                ≥  640px : 2 columns
                ≥ 1280px : 4 columns
            */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              <StatCard
                label="Total shipments"
                value={num(data.shipments.total)}
                sub={`${num(data.shipments.last_24h)} in last 24h`}
                icon={Package}
                tone="brand"
              />
              <StatCard
                label="Active deliveries"
                value={num(data.shipments.active)}
                sub={`${num(data.shipments.delivered)} delivered · ${num(data.shipments.cancelled)} cancelled`}
                icon={TrendingUp}
                tone="sky"
              />
              <StatCard
                label="Revenue (30d)"
                value={money(data.revenue.revenue_30d)}
                sub={`Total: ${money(data.revenue.revenue_total)}`}
                icon={DollarSign}
                tone="emerald"
              />
              <StatCard
                label="Riders online / approved"
                value={`${num(data.riders.online)} / ${num(data.riders.approved)}`}
                sub={`${num(data.riders.pending_approval)} pending approval`}
                icon={Users}
                tone="amber"
              />
            </div>

            {/* Charts stack on mobile, split 2:1 from lg */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="card p-4 sm:p-6 lg:col-span-2">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink-900 dark:text-ink-100">
                      Revenue &amp; rider payouts
                    </h3>
                    <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
                      Last 30 days · daily
                    </p>
                  </div>
                  {/* shrink-0 stops this colliding with the heading on narrow cards */}
                  <Link href="/reports" className="link inline-flex shrink-0 items-center gap-1 text-xs">
                    Reports <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
                {/* Chart needs a bounded height; ResponsiveContainer handles width */}
                <div className="h-56 sm:h-64 lg:h-72">
                  <RevenueBarChart data={revenue} />
                </div>
              </div>

              <div className="card p-4 sm:p-6">
                <h3 className="font-semibold text-ink-900 dark:text-ink-100">Shipments by status</h3>
                <p className="mb-2 mt-0.5 text-xs text-ink-500 dark:text-ink-400">All time</p>
                <div className="h-56 sm:h-64">
                  <StatusPieChart data={data.by_status} />
                </div>
              </div>
            </div>

            {/* Recent shipments — table on desktop, cards on mobile */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-4 sm:px-6 dark:border-ink-800">
                <h3 className="font-semibold text-ink-900 dark:text-ink-100">Recent shipments</h3>
                <Link href="/shipments" className="link inline-flex shrink-0 items-center gap-1 text-xs">
                  View all <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <DataTable
                rows={data.recent_shipments}
                columns={recentColumns}
                keyField="id"
                onRowClick={(s) => router.push(`/shipments/${s.id}`)}
                empty={
                  <div className="p-6 text-center text-sm text-ink-500 dark:text-ink-400">
                    No shipments yet.
                  </div>
                }
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
