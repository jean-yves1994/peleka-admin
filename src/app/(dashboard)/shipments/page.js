'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Filter } from 'lucide-react';
import TopBar from '@/components/TopBar';
import DataTable, { FilterBar } from '@/components/DataTable';
import { ShipmentBadge } from '@/components/Badge';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { api } from '@/lib/api';
import { money, dateShort } from '@/lib/format';

const STATUS_OPTIONS = [
  '', 'pending_payment', 'awaiting_assignment', 'assigned',
  'rider_en_route_to_pickup', 'picked_up', 'in_transit', 'out_for_delivery',
  'delivered', 'failed_pickup', 'failed_delivery', 'returned', 'cancelled',
];

export default function ShipmentsPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0 });
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, pageSize: 20 });
      if (q) p.set('q', q);
      if (status) p.set('status', status);
      const r = await api.get(`/api/admin/shipments?${p.toString()}`);
      setRows(r.data);
      setMeta(r.meta);
    } finally {
      setLoading(false);
    }
  }, [page, q, status]);

  useEffect(() => { load(); }, [load]);

  const columns = [
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
      key: 'customer',
      label: 'Customer',
      render: (s) => (
        <>
          <div className="font-medium">{s.customer_name}</div>
          <div className="text-xs text-ink-500 dark:text-ink-400">{s.customer_phone}</div>
        </>
      ),
    },
    {
      key: 'rider',
      label: 'Rider',
      render: (s) =>
        s.rider_name ? (
          <>
            <div className="font-medium">{s.rider_name}</div>
            <div className="text-xs text-ink-500 dark:text-ink-400">{s.rider_phone}</div>
          </>
        ) : (
          <span className="text-xs text-ink-400">Unassigned</span>
        ),
    },
    {
      key: 'route',
      label: 'Route',
      render: (s) => `${s.pickup_city || '—'} → ${s.delivery_city || '—'}`,
      className: 'text-xs',
    },
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
      hideOnMobile: true,       // low value on a phone — keeps the card tight
      render: (s) => dateShort(s.created_at),
      className: 'text-xs text-ink-500 dark:text-ink-400',
    },
  ];

  return (
    <>
      <TopBar title="Shipments" subtitle={`${meta.total || 0} shipments`} />

      <div className="space-y-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <FilterBar>
          <div className="min-w-0 flex-1 sm:min-w-[220px]">
            <label className="label">Search</label>
            <input
              className="input"
              placeholder="Tracking, sender or recipient…"
              value={q}
              onChange={(e) => { setPage(1); setQ(e.target.value); }}
            />
          </div>
          <div className="sm:min-w-[200px]">
            <label className="label">Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => { setPage(1); setStatus(e.target.value); }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s ? s.replace(/_/g, ' ') : 'All statuses'}
                </option>
              ))}
            </select>
          </div>
          <button onClick={load} className="btn btn-outline w-full justify-center sm:w-auto">
            <Filter className="h-4 w-4" /> Apply
          </button>
        </FilterBar>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-sm text-ink-500 dark:text-ink-400">Loading shipments…</div>
          ) : (
            <DataTable
              rows={rows}
              columns={columns}
              keyField="id"
              onRowClick={(s) => router.push(`/shipments/${s.id}`)}
              empty={
                <EmptyState
                  icon={Package}
                  title="No shipments found"
                  subtitle="Try adjusting the filters."
                />
              }
              footer={
                rows.length > 0 && (
                  <Pagination
                    page={meta.page}
                    pageSize={meta.pageSize}
                    total={meta.total}
                    onChange={setPage}
                  />
                )
              }
            />
          )}
        </div>
      </div>
    </>
  );
}
