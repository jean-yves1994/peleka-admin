'use client';
import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import TopBar from '@/components/TopBar';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { api } from '@/lib/api';
import { relative } from '@/lib/format';

export default function NotificationsPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page:1, pageSize:20, total:0 });
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, pageSize: 20 });
      if (unreadOnly) p.set('unread', 'true');
      const r = await api.get(`/api/me/notifications?${p.toString()}`);
      setRows(r.data); setMeta(r.meta);
    } finally { setLoading(false); }
  }, [page, unreadOnly]);
  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => { await api.patch('/api/me/notifications', {}); load(); };
  const markRead = async (id) => { await api.patch(`/api/me/notifications/${id}/read`); load(); };

  return (
    <>
      <TopBar title="Notifications" subtitle={`${meta.total} in your inbox`}
        actions={<button onClick={markAllRead} className="btn btn-outline"><CheckCheck className="w-4 h-4" /> Mark all read</button>} />
      <div className="px-8 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={unreadOnly} onChange={e => { setPage(1); setUnreadOnly(e.target.checked); }} />
            <span>Show unread only</span>
          </label>
        </div>

        <div className="card overflow-hidden">
          {loading ? <div className="p-6 text-sm text-ink-500 dark:text-ink-400">Loading…</div>
           : rows.length === 0 ? <EmptyState icon={Bell} title="No notifications" subtitle="You're all caught up!" />
           : (
            <>
              <ul>
                {rows.map(n => (
                  <li key={n.id} onClick={() => !n.read_at && markRead(n.id)}
                      className={`px-6 py-4 border-b border-ink-100 dark:border-ink-800 last:border-0 flex gap-4 cursor-pointer transition ${n.read_at ? '' : 'bg-brand-50/40 dark:bg-brand-900/20 hover:bg-brand-50/60 dark:hover:bg-brand-900/30'}`}>
                    <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${n.read_at ? 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400' : 'bg-brand-500 text-white'}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className={`text-sm ${n.read_at ? '' : 'font-semibold'}`}>{n.title}</div>
                        <div className="text-xs text-ink-500 dark:text-ink-400 shrink-0">{relative(n.created_at)}</div>
                      </div>
                      <div className="text-sm text-ink-600 dark:text-ink-300 mt-0.5">{n.body}</div>
                    </div>
                    {!n.read_at && <div className="w-2 h-2 rounded-full bg-brand-500 mt-2" />}
                  </li>
                ))}
              </ul>
              <Pagination page={meta.page} pageSize={meta.pageSize} total={meta.total} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
