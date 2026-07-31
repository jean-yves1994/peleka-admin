'use client';
import { useEffect, useState, useCallback } from 'react';
import { UserCircle } from 'lucide-react';
import TopBar from '@/components/TopBar';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { api } from '@/lib/api';
import { money, dateShort } from '@/lib/format';

export default function CustomersPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page:1, pageSize:20, total:0 });
  const [q, setQ] = useState(''); const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, pageSize: 20 });
      if (q) p.set('q', q);
      const r = await api.get(`/api/admin/customers?${p.toString()}`);
      setRows(r.data); setMeta(r.meta);
    } finally { setLoading(false); }
  }, [page, q]);
  useEffect(() => { load(); }, [load]);

  return (
    <>
      <TopBar title="Customers" subtitle={`${meta.total} customers`} />
      <div className="px-8 py-6 space-y-4">
        <div className="card p-4">
          <label className="label">Search</label>
          <input className="input max-w-md" placeholder="Name, email or phone…"
            value={q} onChange={e => { setPage(1); setQ(e.target.value); }} />
        </div>
        <div className="card overflow-hidden">
          {loading ? <div className="p-8 text-sm text-ink-500 dark:text-ink-400">Loading customers…</div>
           : rows.length === 0 ? <EmptyState icon={UserCircle} title="No customers found" subtitle="Customers sign up through the mobile app." />
           : (
            <>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead><tr>
                    <th>Customer</th><th>Contact</th>
                    <th className="text-right">Shipments</th><th className="text-right">Wallet</th><th>Joined</th>
                  </tr></thead>
                  <tbody>
                    {rows.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white grid place-items-center text-xs font-semibold">
                              {(c.full_name || '?').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{c.full_name}</div>
                              <div className="text-xs text-ink-500 dark:text-ink-400">{c.status}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm">
                          <div>{c.email || '—'}</div>
                          <div className="text-xs text-ink-500 dark:text-ink-400">{c.phone || '—'}</div>
                        </td>
                        <td className="text-right tabular-nums font-medium">{c.shipment_count || 0}</td>
                        <td className="text-right tabular-nums">{money(c.wallet_balance || 0)}</td>
                        <td className="text-xs text-ink-500 dark:text-ink-400">{dateShort(c.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={meta.page} pageSize={meta.pageSize} total={meta.total} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
