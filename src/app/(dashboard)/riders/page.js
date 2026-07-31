'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { UserPlus, Check, Ban, Star, MapPin, Users, AlertTriangle } from 'lucide-react';
import TopBar from '@/components/TopBar';
import DataTable, { FilterBar } from '@/components/DataTable';
import { RiderBadge } from '@/components/Badge';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import { api } from '@/lib/api';
import { relative } from '@/lib/format';

const RIDER_STATUSES = ['', 'pending_approval', 'approved', 'online', 'busy', 'offline', 'suspended'];

const SUSPENSION_REASONS = [
  { value: 'documents_expired', label: 'Expired documents' },
  { value: 'complaints',        label: 'Multiple customer complaints' },
  { value: 'no_show',           label: 'Repeated no-shows / failed pickups' },
  { value: 'unprofessional',    label: 'Unprofessional behavior' },
  { value: 'policy_violation',  label: 'Policy / safety violation' },
  { value: 'inactive',          label: 'Inactive for too long' },
  { value: 'other',             label: 'Other (specify below)' },
];

export default function RidersPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0 });
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', phone: '',
    vehicle_type: 'motorcycle', vehicle_plate: '', license_number: '',
  });
  const [saving, setSaving] = useState(false);
  const [createErr, setCreateErr] = useState('');

  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendCategory, setSuspendCategory] = useState('complaints');
  const [suspendNotes, setSuspendNotes] = useState('');
  const [suspendSubmitting, setSuspendSubmitting] = useState(false);
  const [suspendErr, setSuspendErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, pageSize: 20 });
      if (q) p.set('q', q);
      if (status) p.set('status', status);
      const r = await api.get(`/api/admin/riders?${p.toString()}`);
      setRows(r.data);
      setMeta(r.meta);
    } finally {
      setLoading(false);
    }
  }, [page, q, status]);

  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e?.preventDefault();
    setCreateErr('');
    setSaving(true);
    try {
      await api.post('/api/admin/riders', form);
      setCreateOpen(false);
      setForm({ email: '', password: '', full_name: '', phone: '', vehicle_type: 'motorcycle', vehicle_plate: '', license_number: '' });
      load();
    } catch (e) {
      setCreateErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const approve = async (id) => { await api.post(`/api/admin/riders/${id}/approve`, {}); load(); };

  const openSuspend = (rider) => {
    setSuspendTarget(rider);
    setSuspendCategory('complaints');
    setSuspendNotes('');
    setSuspendErr('');
  };

  const doSuspend = async () => {
    if (!suspendTarget) return;
    const label = SUSPENSION_REASONS.find((r) => r.value === suspendCategory)?.label || 'Other';
    const reason = suspendNotes.trim() ? `${label} — ${suspendNotes.trim()}` : label;
    if (suspendCategory === 'other' && !suspendNotes.trim()) {
      setSuspendErr('Please describe the reason.');
      return;
    }
    setSuspendSubmitting(true);
    setSuspendErr('');
    try {
      await api.post(`/api/admin/riders/${suspendTarget.id}/suspend`, { reason });
      setSuspendTarget(null);
      load();
    } catch (e) {
      setSuspendErr(e.message || 'Failed to suspend rider');
    } finally {
      setSuspendSubmitting(false);
    }
  };

  // Action buttons need to stay reachable on a phone, so they get their own
  // full-width row on the card rather than being squeezed into a table cell.
  const actionButtons = (r) => (
    <div className="flex flex-wrap gap-2">
      {r.status === 'pending_approval' && (
        <button
          onClick={(e) => { e.stopPropagation(); approve(r.id); }}
          className="btn btn-outline flex-1 justify-center border-emerald-200 text-emerald-700 hover:bg-emerald-50 sm:flex-none dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
        >
          <Check className="h-3.5 w-3.5" /> Approve
        </button>
      )}
      {r.status !== 'suspended' && (
        <button
          onClick={(e) => { e.stopPropagation(); openSuspend(r); }}
          className="btn btn-outline flex-1 justify-center border-rose-200 text-rose-700 hover:bg-rose-50 sm:flex-none dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/30"
        >
          <Ban className="h-3.5 w-3.5" /> Suspend
        </button>
      )}
    </div>
  );

  const columns = [
    {
      key: 'name',
      label: 'Rider',
      primary: true,
      render: (r) => r.full_name,
    },
    {
      key: 'contact',
      label: 'Contact',
      secondary: true,
      render: (r) => r.email || r.phone,
    },
    { key: 'status', label: 'Status', render: (r) => <RiderBadge status={r.status} /> },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (r) => (
        <>
          <div className="font-medium capitalize">{r.vehicle_type}</div>
          <div className="text-ink-500 dark:text-ink-400">{r.vehicle_plate || '—'}</div>
        </>
      ),
      className: 'text-xs',
    },
    {
      key: 'jobs',
      label: 'Delivered',
      align: 'right',
      render: (r) => r.completed_jobs || 0,
      className: 'text-right font-medium tabular-nums',
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (r) => (
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-medium">{Number(r.rating_avg || 0).toFixed(2)}</span>
          <span className="text-ink-500 dark:text-ink-400">({r.rating_count || 0})</span>
        </span>
      ),
      className: 'text-xs',
    },
    {
      key: 'seen',
      label: 'Last seen',
      hideOnMobile: true,
      render: (r) => (r.last_location_at ? relative(r.last_location_at) : 'Never'),
      className: 'text-xs text-ink-500 dark:text-ink-400',
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      hideOnMobile: true,          // rendered separately in the mobile card
      render: (r) => <div className="inline-flex gap-1">{actionButtons(r)}</div>,
    },
  ];

  return (
    <>
      <TopBar
        title="Riders"
        subtitle={`${meta.total || 0} riders`}
        actions={
          <button
            onClick={() => setCreateOpen(true)}
            aria-label="New rider"
            className="btn btn-primary hidden shrink-0 sm:inline-flex"
          >
            <UserPlus className="h-4 w-4" /> New rider
          </button>
        }
      />

      <div className="space-y-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <FilterBar>
          <div className="min-w-0 flex-1 sm:min-w-[220px]">
            <label className="label">Search</label>
            <input
              className="input"
              placeholder="Name, email or phone…"
              value={q}
              onChange={(e) => { setPage(1); setQ(e.target.value); }}
            />
          </div>
          <div className="sm:min-w-[180px]">
            <label className="label">Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => { setPage(1); setStatus(e.target.value); }}
            >
              {RIDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All statuses'}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Link href="/riders/live-map" className="btn btn-outline flex-1 justify-center sm:flex-none">
              <MapPin className="h-4 w-4" /> Live map
            </Link>
            {/* Mobile-only create button — the TopBar one is hidden below sm */}
            <button onClick={() => setCreateOpen(true)} className="btn btn-primary flex-1 justify-center sm:hidden">
              <UserPlus className="h-4 w-4" /> New
            </button>
          </div>
        </FilterBar>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-sm text-ink-500 dark:text-ink-400">Loading riders…</div>
          ) : (
            <DataTable
              rows={rows}
              columns={columns}
              keyField="id"
              empty={
                <EmptyState
                  icon={Users}
                  title="No riders yet"
                  subtitle="Create your first rider account to start dispatching."
                  action={
                    <button onClick={() => setCreateOpen(true)} className="btn btn-primary">
                      <UserPlus className="h-4 w-4" /> New rider
                    </button>
                  }
                />
              }
              mobileCard={(r) => (
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink-900 dark:text-ink-100">
                        {r.full_name}
                      </div>
                      <div className="truncate text-xs text-ink-500 dark:text-ink-400">
                        {r.email || r.phone}
                      </div>
                    </div>
                    <RiderBadge status={r.status} />
                  </div>

                  <dl className="mt-3 grid grid-cols-3 gap-3">
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-ink-400">Vehicle</dt>
                      <dd className="mt-0.5 text-xs capitalize text-ink-800 dark:text-ink-100">
                        {r.vehicle_type}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-ink-400">Delivered</dt>
                      <dd className="mt-0.5 text-xs font-medium tabular-nums text-ink-800 dark:text-ink-100">
                        {r.completed_jobs || 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-ink-400">Rating</dt>
                      <dd className="mt-0.5 flex items-center gap-1 text-xs text-ink-800 dark:text-ink-100">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {Number(r.rating_avg || 0).toFixed(2)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3">{actionButtons(r)}</div>
                </div>
              )}
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

      {/* Create rider */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create rider account"
        size="lg"
        footer={
          <>
            <button onClick={() => setCreateOpen(false)} className="btn btn-ghost w-full justify-center sm:w-auto">
              Cancel
            </button>
            <button onClick={create} disabled={saving} className="btn btn-primary w-full justify-center sm:w-auto">
              {saving ? 'Creating…' : 'Create rider'}
            </button>
          </>
        }
      >
        {createErr && (
          <div className="mb-3 rounded-lg bg-rose-50 p-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
            {createErr}
          </div>
        )}
        <form onSubmit={create} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Full name *</label>
            <input required className="input" value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email *</label>
            <input required type="email" className="input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone *</label>
            <input required className="input" value={form.phone} placeholder="+2507…"
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Temporary password *</label>
            <input required type="text" className="input" value={form.password}
              placeholder="Min 8 chars, letter + digit"
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label">Vehicle type</label>
            <select className="input" value={form.vehicle_type}
              onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
              <option value="motorcycle">Motorcycle</option>
              <option value="bicycle">Bicycle</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
            </select>
          </div>
          <div>
            <label className="label">Vehicle plate</label>
            <input className="input" value={form.vehicle_plate} placeholder="RAA 000 A"
              onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">License number</label>
            <input className="input" value={form.license_number}
              onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
          </div>
        </form>
      </Modal>

      {/* Suspend rider */}
      <Modal
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        title={suspendTarget ? `Suspend ${suspendTarget.full_name}` : 'Suspend rider'}
        footer={
          <>
            <button onClick={() => setSuspendTarget(null)} disabled={suspendSubmitting}
              className="btn btn-ghost w-full justify-center sm:w-auto">
              Never mind
            </button>
            <button onClick={doSuspend} disabled={suspendSubmitting}
              className="btn btn-danger w-full justify-center sm:w-auto">
              {suspendSubmitting ? 'Suspending…' : 'Suspend rider'}
            </button>
          </>
        }
      >
        {suspendTarget && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-3 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">This will immediately suspend the rider.</p>
                <p className="mt-1 text-rose-700 dark:text-rose-300/90">
                  They'll be signed out on all devices and can't accept new deliveries until reactivated.
                </p>
              </div>
            </div>

            {suspendErr && (
              <div className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                {suspendErr}
              </div>
            )}

            <div>
              <label className="label">Reason for suspension *</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SUSPENSION_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition ${
                      suspendCategory === reason.value
                        ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200'
                        : 'border-ink-200 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={suspendCategory === reason.value}
                      onChange={(e) => setSuspendCategory(e.target.value)}
                      className="accent-rose-600"
                    />
                    <span>{reason.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">
                Additional notes {suspendCategory === 'other' && <span className="text-rose-600">*</span>}
              </label>
              <textarea
                rows="3"
                className="input"
                value={suspendNotes}
                onChange={(e) => setSuspendNotes(e.target.value)}
                placeholder={suspendCategory === 'other'
                  ? 'Describe the reason for suspension…'
                  : 'Optional details for the audit log…'}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
