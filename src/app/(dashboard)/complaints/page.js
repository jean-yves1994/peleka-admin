'use client';
import { useEffect, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import TopBar from '@/components/TopBar';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import { Chip } from '@/components/Badge';
import { api } from '@/lib/api';
import { titleCase, dateTime } from '@/lib/format';

const STATUSES = ['', 'open','in_review','resolved','rejected'];

export default function ComplaintsPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page:1, pageSize:20, total:0 });
  const [status, setStatus] = useState(''); const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState(''); const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, pageSize: 20 });
      if (status) p.set('status', status);
      const r = await api.get(`/api/admin/complaints?${p.toString()}`);
      setRows(r.data); setMeta(r.meta);
    } finally { setLoading(false); }
  }, [page, status]);
  useEffect(() => { load(); }, [load]);

  const update = async (newStatus) => {
    setErr('');
    try {
      await api.patch(`/api/admin/complaints/${selected.id}`, { status: newStatus, resolution });
      setSelected(null); setResolution(''); load();
    } catch (e) { setErr(e.message); }
  };
  const tone = (s) => s === 'resolved' ? 'emerald' : s === 'rejected' ? 'rose' : s === 'in_review' ? 'amber' : 'brand';

  return (
    <>
      <TopBar title="Complaints" subtitle={`${meta.total} tickets`} />
      <div className="px-8 py-6 space-y-4">
        <div className="card p-4">
          <label className="label">Filter by status</label>
          <select className="input max-w-xs" value={status} onChange={e => { setPage(1); setStatus(e.target.value); }}>
            {STATUSES.map(s => <option key={s} value={s}>{s ? s.replace(/_/g,' ') : 'All statuses'}</option>)}
          </select>
        </div>

        <div className="card overflow-hidden">
          {loading ? <div className="p-8 text-sm text-ink-500 dark:text-ink-400">Loading…</div>
           : rows.length === 0 ? <EmptyState icon={CheckCircle} title="No complaints" subtitle="All clear!" />
           : (
            <>
              <table className="table w-full">
                <thead><tr>
                  <th>Subject</th><th>Category</th><th>Shipment</th><th>Raised by</th><th>Status</th><th>Received</th><th></th>
                </tr></thead>
                <tbody>
                  {rows.map(c => (
                    <tr key={c.id} className="cursor-pointer" onClick={() => setSelected(c)}>
                      <td>
                        <div className="font-medium">{c.subject}</div>
                        <div className="text-xs text-ink-500 dark:text-ink-400 truncate max-w-xs">{c.description}</div>
                      </td>
                      <td><Chip tone={c.category === 'lost' || c.category === 'damage' ? 'rose' : 'amber'}>{titleCase(c.category)}</Chip></td>
                      <td className="text-xs font-mono">{c.tracking_number || '—'}</td>
                      <td className="text-xs">
                        <div className="font-medium">{c.raised_by_name}</div>
                        <div className="text-ink-500 dark:text-ink-400">{c.raised_by_email}</div>
                      </td>
                      <td><Chip tone={tone(c.status)}>{titleCase(c.status)}</Chip></td>
                      <td className="text-xs text-ink-500 dark:text-ink-400">{dateTime(c.created_at)}</td>
                      <td className="text-right"><AlertCircle className="w-4 h-4 text-ink-400 inline" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={meta.page} pageSize={meta.pageSize} total={meta.total} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      <Modal open={!!selected} onClose={() => { setSelected(null); setResolution(''); setErr(''); }} title="Complaint details" size="lg"
        footer={selected?.status !== 'resolved' && selected?.status !== 'rejected' && (
          <>
            <button onClick={() => update('rejected')} className="btn btn-outline text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/30">
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button onClick={() => update('resolved')} className="btn btn-primary"><CheckCircle className="w-4 h-4" /> Resolve</button>
          </>
        )}>
        {err && <div className="mb-3 p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm rounded-lg">{err}</div>}
        {selected && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Chip tone={selected.category === 'lost' || selected.category === 'damage' ? 'rose' : 'amber'}>{titleCase(selected.category)}</Chip>
                <Chip tone={tone(selected.status)}>{titleCase(selected.status)}</Chip>
              </div>
              <h4 className="text-base font-semibold">{selected.subject}</h4>
              <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">Received {dateTime(selected.created_at)}</div>
            </div>
            <div className="bg-ink-50 dark:bg-ink-800/50 rounded-xl p-4 text-sm whitespace-pre-wrap">{selected.description}</div>
            {selected.attachments?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-ink-500 dark:text-ink-400 mb-2 uppercase tracking-wider">Attachments</div>
                <div className="grid grid-cols-4 gap-2">
                  {selected.attachments.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noreferrer" className="block">
                      <div className="aspect-square bg-ink-100 dark:bg-ink-800 rounded-lg overflow-hidden">
                        <img src={a.url} alt="attachment" className="w-full h-full object-cover" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {selected.resolution && (
              <div className="border-t border-ink-100 dark:border-ink-800 pt-4">
                <div className="text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1 uppercase tracking-wider">Resolution</div>
                <div className="text-sm">{selected.resolution}</div>
              </div>
            )}
            {selected.status !== 'resolved' && selected.status !== 'rejected' && (
              <div>
                <label className="label">Resolution note</label>
                <textarea rows="3" className="input" value={resolution} onChange={e => setResolution(e.target.value)} placeholder="How was this handled?" />
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
