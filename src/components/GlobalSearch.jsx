'use client';
/**
 * GlobalSearch — a command-palette style search that actually works.
 *
 * Queries three backend endpoints in parallel:
 *   - GET /api/admin/shipments?q=...&pageSize=5
 *   - GET /api/admin/riders?q=...&pageSize=5
 *   - GET /api/admin/customers?q=...&pageSize=5
 *
 * Features
 *   - Cmd/Ctrl + K to open, Esc to close
 *   - 250 ms debounce so we don't hammer the backend
 *   - Keyboard navigation (↑/↓/Enter)
 *   - Grouped results with icons
 *   - Click or Enter navigates to the item's detail page
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Users, UserCircle, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { titleCase, money } from '@/lib/format';

export default function GlobalSearch({ open, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ shipments: [], riders: [], customers: [] });
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const debounced = useDebounce(query, 250);

  // Focus input & reset state when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setResults({ shipments: [], riders: [], customers: [] });
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  // Fetch as the (debounced) query changes
  useEffect(() => {
    if (!open) return;
    const q = debounced.trim();
    if (q.length < 2) {
      setResults({ shipments: [], riders: [], customers: [] });
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const enc = encodeURIComponent(q);
        const [ships, riders, customers] = await Promise.allSettled([
          api.get(`/api/admin/shipments?q=${enc}&pageSize=5`),
          api.get(`/api/admin/riders?q=${enc}&pageSize=5`),
          api.get(`/api/admin/customers?q=${enc}&pageSize=5`),
        ]);
        if (cancelled) return;
        setResults({
          shipments: ships.status === 'fulfilled' ? ships.value.data : [],
          riders:    riders.status === 'fulfilled' ? riders.value.data : [],
          customers: customers.status === 'fulfilled' ? customers.value.data : [],
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debounced, open]);

  // Flatten results into a single navigable list (keyboard arrows walk through this)
  const flat = useMemo(() => {
    const items = [];
    results.shipments.forEach(s => items.push({
      type: 'shipment', id: s.id, href: `/shipments/${s.id}`,
      primary: s.tracking_number,
      secondary: `${titleCase(s.status)} · ${s.customer_name} → ${s.rider_name || 'Unassigned'}`,
      trailing: money(s.total_price, s.currency),
      icon: Package,
    }));
    results.riders.forEach(r => items.push({
      type: 'rider', id: r.id, href: `/riders`,
      primary: r.full_name,
      secondary: `${r.vehicle_type} · ${r.vehicle_plate || '—'} · ${titleCase(r.status)}`,
      trailing: `${r.completed_jobs || 0} delivered`,
      icon: Users,
    }));
    results.customers.forEach(c => items.push({
      type: 'customer', id: c.id, href: `/customers`,
      primary: c.full_name,
      secondary: `${c.email || c.phone || '—'} · ${c.shipment_count || 0} shipments`,
      trailing: money(c.wallet_balance, 'RWF'),
      icon: UserCircle,
    }));
    return items;
  }, [results]);

  // Reset active index when results change
  useEffect(() => { setActiveIdx(0); }, [flat.length]);

  // Keyboard handling
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, Math.max(0, flat.length - 1))); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      else if (e.key === 'Enter') {
        const hit = flat[activeIdx];
        if (hit) { onClose(); router.push(hit.href); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, flat, activeIdx, onClose, router]);

  if (!open) return null;

  const hasQuery = debounced.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24 bg-ink-900/50 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
           className="w-full max-w-2xl bg-white dark:bg-ink-900 rounded-2xl shadow-2xl border border-ink-100 dark:border-ink-800 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-100 dark:border-ink-800">
          <Search className="w-4 h-4 text-ink-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search shipments, riders, customers…"
            className="flex-1 bg-transparent text-sm focus:outline-none text-ink-800 dark:text-ink-100 placeholder-ink-400"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-ink-400" />}
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {!hasQuery && (
            <div className="px-4 py-8 text-center text-sm text-ink-500 dark:text-ink-400">
              Type at least 2 characters to search across shipments, riders and customers.
              <div className="mt-3 flex items-center justify-center gap-3 text-xs">
                <span className="kbd">↑</span><span className="kbd">↓</span>
                <span>to navigate ·</span>
                <span className="kbd">↵</span>
                <span>to open ·</span>
                <span className="kbd">Esc</span>
                <span>to close</span>
              </div>
            </div>
          )}

          {hasQuery && !loading && flat.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-ink-500 dark:text-ink-400">
              No results found for <b>"{debounced}"</b>.
            </div>
          )}

          {hasQuery && flat.length > 0 && (
            <>
              <ResultGroup title="Shipments" items={results.shipments.map((s, i) => ({ ...flat.filter(f => f.type === 'shipment')[i] }))}
                startIdx={0} activeIdx={activeIdx} flat={flat} onPick={(href) => { onClose(); router.push(href); }} />
              <ResultGroup title="Riders" items={results.riders.map((r, i) => ({ ...flat.filter(f => f.type === 'rider')[i] }))}
                startIdx={results.shipments.length} activeIdx={activeIdx} flat={flat} onPick={(href) => { onClose(); router.push(href); }} />
              <ResultGroup title="Customers" items={results.customers.map((c, i) => ({ ...flat.filter(f => f.type === 'customer')[i] }))}
                startIdx={results.shipments.length + results.riders.length} activeIdx={activeIdx} flat={flat} onPick={(href) => { onClose(); router.push(href); }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultGroup({ title, items, startIdx, activeIdx, flat, onPick }) {
  if (!items.length) return null;
  return (
    <div className="py-1">
      <div className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-500">
        {title}
      </div>
      {items.map((item, i) => {
        const idx = startIdx + i;
        const active = flat[activeIdx]?.id === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onPick(item.href)}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 transition ${
              active
                ? 'bg-brand-50 dark:bg-brand-900/30'
                : 'hover:bg-ink-50 dark:hover:bg-ink-800/60'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${
              active ? 'bg-brand-500 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400'
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium truncate ${active ? 'text-brand-700 dark:text-brand-300' : 'text-ink-900 dark:text-ink-100'}`}>
                {item.primary}
              </div>
              <div className="text-xs text-ink-500 dark:text-ink-400 truncate">{item.secondary}</div>
            </div>
            {item.trailing && (
              <div className="text-xs text-ink-500 dark:text-ink-400 shrink-0 tabular-nums">{item.trailing}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
