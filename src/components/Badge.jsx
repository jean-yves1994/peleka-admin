import { SHIPMENT_STATUS_COLORS, RIDER_STATUS_COLORS } from '@/lib/constants';
import { titleCase } from '@/lib/format';

export function ShipmentBadge({ status }) {
  const t = SHIPMENT_STATUS_COLORS[status] || SHIPMENT_STATUS_COLORS.draft;
  return (
    <span className={`badge ${t.bg} ${t.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
      {titleCase(status)}
    </span>
  );
}
export function RiderBadge({ status }) {
  const t = RIDER_STATUS_COLORS[status] || RIDER_STATUS_COLORS.offline;
  return <span className={`badge ${t.bg} ${t.text}`}>{titleCase(status)}</span>;
}
export function Chip({ children, tone = 'slate' }) {
  const tones = {
    slate:   'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    brand:   'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    amber:   'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    rose:    'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  };
  return <span className={`badge ${tones[tone] || tones.slate}`}>{children}</span>;
}
