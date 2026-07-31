export function money(n, currency = 'RWF') {
  if (n === null || n === undefined || n === '') return '—';
  const v = Number(n);
  if (Number.isNaN(v)) return '—';
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: currency === 'RWF' ? 0 : 2 }).format(v); }
  catch { return `${currency} ${v.toFixed(2)}`; }
}
export function num(n) {
  if (n === null || n === undefined) return '0';
  return new Intl.NumberFormat().format(Number(n));
}
export function dateShort(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}
export function dateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
export function relative(iso) {
  if (!iso) return '—';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60)    return `${Math.floor(s)}s ago`;
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}
export function titleCase(s) {
  if (!s) return '';
  return String(s).replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase());
}
export const CITY = {
  name: process.env.NEXT_PUBLIC_CITY_NAME || 'Kigali',
  lat: Number(process.env.NEXT_PUBLIC_CITY_LAT || -1.9441),
  lng: Number(process.env.NEXT_PUBLIC_CITY_LNG ||  30.0619),
};
