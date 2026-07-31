'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Package, User, Phone, Truck, Camera,
  Star, DollarSign, AlertTriangle, XCircle,
} from 'lucide-react';
import TopBar from '@/components/TopBar';
import { ShipmentBadge, Chip } from '@/components/Badge';
import Modal from '@/components/Modal';
import { api } from '@/lib/api';
import { money, dateTime, relative, titleCase } from '@/lib/format';

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riders, setRiders] = useState([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState('');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await api.get(`/api/shipments/${id}`); setD(r.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const openAssign = async () => {
    setAssignOpen(true); setErr('');
    try { const r = await api.get('/api/admin/riders?status=approved&pageSize=100'); setRiders(r.data); }
    catch (e) { setErr(e.message); }
  };
  const doAssign = async () => {
    if (!selectedRider) return;
    try {
      const isReassign = !!d.shipment.rider_id;
      await api.post(`/api/admin/shipments/${id}/${isReassign ? 'reassign' : 'assign'}`,
        { rider_id: selectedRider, expires_in_minutes: 15 });
      setAssignOpen(false); setSelectedRider(''); load();
    } catch (e) { setErr(e.message); }
  };
  const doCancel = async () => {
    try {
      await api.post(`/api/shipments/${id}/cancel`, { reason: reason || 'Cancelled by admin' });
      setCancelOpen(false); setReason(''); load();
    } catch (e) { setErr(e.message); }
  };

  if (loading || !d) return (<><TopBar title="Shipment" /><div className="px-8 py-6 text-sm text-ink-500 dark:text-ink-400">Loading…</div></>);

  const s = d.shipment;
  const canAssign = !['delivered','cancelled','returned','failed_delivery','failed_pickup'].includes(s.status);
  const canCancel = ['awaiting_assignment','assigned','rider_en_route_to_pickup'].includes(s.status);

  return (
    <>
      <TopBar title={s.tracking_number}
        subtitle={<span><ShipmentBadge status={s.status} /> · Created {relative(s.created_at)}</span>}
        actions={
          <div className="flex items-center gap-2">
            {canAssign && (
              <button onClick={openAssign} className="btn btn-primary">
                <Truck className="w-4 h-4" /> {s.rider_id ? 'Reassign rider' : 'Assign rider'}
              </button>
            )}
            {canCancel && (
              <button onClick={() => setCancelOpen(true)}
                className="btn btn-outline text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/30">
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>
        } />

      <div className="px-8 py-6 space-y-6">
        <Link href="/shipments" className="inline-flex items-center gap-1 text-xs link">
          <ArrowLeft className="w-3 h-3" /> Back to shipments
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Route */}
            <div className="card p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-4">Route</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400 mb-1"><MapPin className="w-3 h-3 text-emerald-600" /> Pickup</div>
                  <div className="font-medium">{s.pickup_address}</div>
                  <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">{s.pickup_city}</div>
                  {s.pickup_notes && <div className="mt-2 text-xs bg-ink-50 dark:bg-ink-800 rounded-lg p-2 text-ink-600 dark:text-ink-300">{s.pickup_notes}</div>}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400 mb-1"><MapPin className="w-3 h-3 text-rose-600" /> Delivery</div>
                  <div className="font-medium">{s.delivery_address}</div>
                  <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">{s.delivery_city}</div>
                  {s.delivery_notes && <div className="mt-2 text-xs bg-ink-50 dark:bg-ink-800 rounded-lg p-2 text-ink-600 dark:text-ink-300">{s.delivery_notes}</div>}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Chip tone="brand">Distance: {Number(s.distance_km).toFixed(1)} km</Chip>
                <Chip tone="slate">Duration: {Number(s.duration_minutes).toFixed(0)} min</Chip>
                <Chip tone="slate">Weight: {Number(s.parcel_weight_kg).toFixed(2)} kg</Chip>
                {s.is_fragile && <Chip tone="amber">Fragile</Chip>}
                {s.requires_signature && <Chip tone="amber">Signature required</Chip>}
              </div>
            </div>

            {/* Sender + Recipient */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-3 flex items-center gap-2"><User className="w-3 h-3" /> Sender</h3>
                <div className="font-medium">{s.sender_name}</div>
                <div className="text-sm flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{s.sender_phone}</div>
                {s.sender_email && <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">{s.sender_email}</div>}
              </div>
              <div className="card p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-3 flex items-center gap-2"><User className="w-3 h-3" /> Recipient</h3>
                <div className="font-medium">{s.recipient_name}</div>
                <div className="text-sm flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{s.recipient_phone}</div>
                {s.recipient_email && <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">{s.recipient_email}</div>}
              </div>
            </div>

            {/* Timeline */}
            <div className="card p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-4">Status timeline</h3>
              <ol className="space-y-4">
                {d.status_history.map((h, i) => (
                  <li key={h.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${i === d.status_history.length - 1 ? 'bg-brand-600' : 'bg-ink-400 dark:bg-ink-700'}`} />
                      {i < d.status_history.length - 1 && <div className="w-px flex-1 bg-ink-200 dark:bg-ink-800 mt-1" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{titleCase(h.to_status)}</div>
                        <div className="text-xs text-ink-500 dark:text-ink-400">{dateTime(h.created_at)}</div>
                      </div>
                      {h.note && <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{h.note}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Proofs */}
            {d.proofs.length > 0 && (
              <div className="card p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-4 flex items-center gap-2"><Camera className="w-3 h-3" /> Proofs</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {d.proofs.map(p => (
                    <a key={p.id} href={p.file_url} target="_blank" rel="noreferrer" className="block group">
                      <div className="aspect-square bg-ink-100 dark:bg-ink-800 rounded-xl overflow-hidden">
                        <img src={p.file_url} alt={p.kind} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      </div>
                      <div className="mt-1 text-xs font-medium">{titleCase(p.kind)}</div>
                      <div className="text-[10px] text-ink-500 dark:text-ink-400">{dateTime(p.captured_at)}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Rating */}
            {d.rating && (
              <div className="card p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-3 flex items-center gap-2"><Star className="w-3 h-3" /> Rating</h3>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < d.rating.score ? 'fill-amber-400 text-amber-400' : 'text-ink-400 dark:text-ink-700'}`} />
                  ))}
                  <span className="text-sm font-semibold ml-2">{d.rating.score}/5</span>
                </div>
                {d.rating.comment && <div className="mt-3 text-sm italic">"{d.rating.comment}"</div>}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-4 flex items-center gap-2"><DollarSign className="w-3 h-3" /> Pricing</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink-500 dark:text-ink-400">Base fare</dt><dd className="font-medium tabular-nums">{money(s.base_fare, s.currency)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500 dark:text-ink-400">Distance fee</dt><dd className="font-medium tabular-nums">{money(s.distance_fee, s.currency)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500 dark:text-ink-400">Weight fee</dt><dd className="font-medium tabular-nums">{money(s.weight_fee, s.currency)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500 dark:text-ink-400">Subtotal</dt><dd className="font-medium tabular-nums">{money(s.subtotal, s.currency)}</dd></div>
                {Number(s.discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400"><dt>Discount {s.discount_code ? `(${s.discount_code})` : ''}</dt><dd className="tabular-nums">−{money(s.discount_amount, s.currency)}</dd></div>
                )}
                <div className="flex justify-between"><dt className="text-ink-500 dark:text-ink-400">Tax</dt><dd className="font-medium tabular-nums">{money(s.tax_amount, s.currency)}</dd></div>
                <div className="border-t border-ink-100 dark:border-ink-800 pt-2 mt-1 flex justify-between">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-semibold text-brand-600 dark:text-brand-400 tabular-nums">{money(s.total_price, s.currency)}</dd>
                </div>
                <div className="flex justify-between text-xs text-ink-500 dark:text-ink-400 pt-1"><dt>Rider earnings</dt><dd className="tabular-nums">{money(s.rider_earnings, s.currency)}</dd></div>
              </dl>
            </div>

            <div className="card p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-3">Payments</h3>
              {d.payments.length === 0 ? (
                <div className="text-xs text-ink-500 dark:text-ink-400">No payments recorded.</div>
              ) : d.payments.map(p => (
                <div key={p.id} className="flex justify-between items-start py-2 border-b border-ink-100 dark:border-ink-800 last:border-0">
                  <div>
                    <div className="text-sm font-medium">{titleCase(p.method)}</div>
                    <div className="text-xs text-ink-500 dark:text-ink-400">{p.provider} · {dateTime(p.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium tabular-nums">{money(p.amount, p.currency)}</div>
                    <Chip tone={p.status === 'paid' ? 'emerald' : p.status === 'failed' ? 'rose' : 'amber'}>{titleCase(p.status)}</Chip>
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-3 flex items-center gap-2"><Package className="w-3 h-3" /> Parcel</h3>
              <div className="text-sm mb-2">{s.parcel_description}</div>
              {s.parcel_category && <Chip>{s.parcel_category}</Chip>}
              {s.parcel_declared_value && (
                <div className="mt-3 text-xs text-ink-500 dark:text-ink-400">Declared value: <span className="font-medium text-ink-800 dark:text-ink-100">{money(s.parcel_declared_value, s.currency)}</span></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)}
        title={s.rider_id ? 'Reassign shipment' : 'Assign rider'}
        footer={<>
          <button onClick={() => setAssignOpen(false)} className="btn btn-ghost">Cancel</button>
          <button onClick={doAssign} disabled={!selectedRider} className="btn btn-primary">Assign</button>
        </>}>
        {err && <div className="mb-3 p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm rounded-lg">{err}</div>}
        <div className="max-h-96 overflow-y-auto space-y-1">
          {riders.map(r => (
            <label key={r.id}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border ${selectedRider === r.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30' : 'border-ink-100 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-800'}`}>
              <input type="radio" name="rider" value={r.id} checked={selectedRider === r.id} onChange={e => setSelectedRider(e.target.value)} />
              <div className="flex-1">
                <div className="font-medium">{r.full_name}</div>
                <div className="text-xs text-ink-500 dark:text-ink-400">{r.vehicle_type} · {r.vehicle_plate || '—'} · ⭐ {Number(r.rating_avg || 0).toFixed(1)}</div>
              </div>
              <Chip tone={r.status === 'online' ? 'emerald' : 'slate'}>{r.status}</Chip>
            </label>
          ))}
        </div>
      </Modal>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel shipment"
        footer={<>
          <button onClick={() => setCancelOpen(false)} className="btn btn-ghost">Never mind</button>
          <button onClick={doCancel} className="btn btn-danger">Cancel shipment</button>
        </>}>
        <div className="flex gap-3 items-start p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 mb-4">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="text-sm">This action cannot be undone. The customer and rider will be notified.</div>
        </div>
        <label className="label">Reason</label>
        <textarea rows="3" className="input" value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is this being cancelled?" />
      </Modal>
    </>
  );
}
