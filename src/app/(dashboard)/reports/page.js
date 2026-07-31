"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Download,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  Star,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import StatCard from "@/components/StatCard";
import DataTable, { FilterBar } from "@/components/DataTable";
import RevenueBarChart from "@/components/charts/RevenueBarChart";
import StatusPieChart from "@/components/charts/StatusPieChart";
import { api } from "@/lib/api";
import { money, num } from "@/lib/format";

const today = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

export default function ReportsPage() {
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [groupBy, setGroupBy] = useState("day");
  const [revenue, setRevenue] = useState([]);
  const [deliveries, setDeliveries] = useState(null);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = `?from=${from}&to=${to}`;
      const [rev, del, rid] = await Promise.all([
        api.get(`/api/admin/reports/revenue${q}&groupBy=${groupBy}`),
        api.get(`/api/admin/reports/deliveries${q}`),
        api.get(`/api/admin/reports/riders${q}`),
      ]);
      setRevenue(rev.data);
      setDeliveries(del.data);
      setRiders(rid.data);
    } finally {
      setLoading(false);
    }
  }, [from, to, groupBy]);

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

  const totals = revenue.reduce(
    (acc, r) => {
      acc.revenue += Number(r.revenue || 0);
      acc.payouts += Number(r.rider_payouts || 0);
      acc.deliveries += Number(r.deliveries || 0);
      return acc;
    },
    { revenue: 0, payouts: 0, deliveries: 0 },
  );

  const exportCsv = () => {
    const header = [
      "Bucket",
      "Deliveries",
      "Revenue",
      "Rider payouts",
      "Tax",
      "Currency",
    ];
    const rows = revenue.map((r) => [
      r.bucket,
      r.deliveries,
      r.revenue,
      r.rider_payouts,
      r.tax_collected,
      r.currency,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const leaderboardColumns = [
    {
      key: "rank",
      label: "Rank",
      render: (r) => (
        <span className="font-semibold text-ink-500 dark:text-ink-400">
          #{riders.indexOf(r) + 1}
        </span>
      ),
    },
    {
      key: "rider",
      label: "Rider",
      primary: true,
      render: (r) => r.full_name,
    },
    {
      key: "contact",
      label: "Contact",
      secondary: true,
      render: (r) => r.email || r.phone,
    },
    {
      key: "deliveries",
      label: "Deliveries",
      align: "right",
      render: (r) => num(r.deliveries),
      className: "text-right font-medium tabular-nums",
    },
    {
      key: "earnings",
      label: "Earnings",
      align: "right",
      render: (r) => money(r.earnings),
      className: "text-right font-medium tabular-nums",
    },
    {
      key: "rating",
      label: "Rating",
      render: (r) => (
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {Number(r.rating_avg || 0).toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <>
      <TopBar
        title="Reports"
        subtitle="Revenue, delivery performance, and rider leaderboard."
      />

      <div className="space-y-4 px-4 py-5 sm:px-6 lg:space-y-6 lg:px-8 lg:py-6">
        <FilterBar>
          <div className="min-w-0 flex-1 sm:min-w-[150px] sm:flex-none">
            <label className="label">From</label>
            <input
              type="date"
              className="input"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="min-w-0 flex-1 sm:min-w-[150px] sm:flex-none">
            <label className="label">To</label>
            <input
              type="date"
              className="input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="min-w-0 flex-1 sm:min-w-[140px] sm:flex-none">
            <label className="label">Group by</label>
            <select
              className="input"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="btn btn-primary flex-1 justify-center sm:flex-none"
            >
              <Calendar className="h-4 w-4" /> Apply
            </button>
            <button
              onClick={exportCsv}
              className="btn btn-outline flex-1 justify-center sm:flex-none"
            >
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </FilterBar>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <StatCard
            label="Total revenue"
            value={money(totals.revenue)}
            icon={DollarSign}
            tone="brand"
          />
          <StatCard
            label="Rider payouts"
            value={money(totals.payouts)}
            icon={Users}
            tone="sky"
          />
          <StatCard
            label="Deliveries"
            value={num(totals.deliveries)}
            icon={TrendingUp}
            tone="emerald"
          />
          <StatCard
            label="Avg delivery time"
            value={
              deliveries?.delivery_time_stats?.avg_minutes_assigned_to_delivered
                ? `${Number(deliveries.delivery_time_stats.avg_minutes_assigned_to_delivered).toFixed(0)} min`
                : "—"
            }
            sub="From assign to delivered"
            icon={Clock}
            tone="amber"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/*
            THE FIX — both charts now sit inside an explicit-height wrapper,
            exactly as on the Dashboard.

            The chart components are built to fill their parent (`h-full`).
            Previously these were rendered straight into `.card p-6`, whose
            height is auto — so `h-full` resolved to nothing, the bar chart's
            `flex-1` got no room, and the pie's ResizeObserver measured a
            height of 0 and couldn't lay itself out.

            `overflow-hidden` is belt-and-braces: it clips at the card edge so
            nothing can bleed into the section below.
          */}
          <div className="card overflow-hidden p-4 sm:p-6 lg:col-span-2">
            <h3 className="mb-4 font-semibold text-ink-900 dark:text-ink-100">
              Revenue over time
            </h3>
            {loading ? (
              <div className="flex h-64 items-center justify-center text-sm text-ink-500 sm:h-72 dark:text-ink-400">
                Loading…
              </div>
            ) : (
              <div className="h-64 sm:h-72">
                <RevenueBarChart data={revenue} />
              </div>
            )}
          </div>

          <div className="card overflow-hidden p-4 sm:p-6">
            <h3 className="mb-4 font-semibold text-ink-900 dark:text-ink-100">
              Shipments by status
            </h3>
            {loading ? (
              <div className="flex h-80 items-center justify-center text-sm text-ink-500 sm:h-72 dark:text-ink-400">
                Loading…
              </div>
            ) : (
              // Taller on mobile than the bar chart: the donut needs room for
              // itself PLUS the legend rows underneath.
              <div className="h-80 sm:h-72">
                <StatusPieChart data={deliveries?.by_status || []} />
              </div>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-ink-100 px-4 py-4 sm:px-6 dark:border-ink-800">
            <h3 className="font-semibold text-ink-900 dark:text-ink-100">
              Rider leaderboard
            </h3>
            <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
              Top performers in the selected period
            </p>
          </div>
          {loading ? (
            <div className="p-8 text-sm text-ink-500 dark:text-ink-400">
              Loading…
            </div>
          ) : (
            <DataTable
              rows={riders}
              columns={leaderboardColumns}
              keyField="id"
              empty={
                <div className="p-6 text-center text-sm text-ink-500 dark:text-ink-400">
                  No deliveries in the selected period.
                </div>
              }
            />
          )}
        </div>
      </div>
    </>
  );
}
