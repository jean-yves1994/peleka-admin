'use client';
import { useEffect, useState, useRef } from 'react';
import { RefreshCw, MapPin, Star } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import TopBar from '@/components/TopBar';
import { RiderBadge } from '@/components/Badge';
import { api } from '@/lib/api';
import { relative, CITY } from '@/lib/format';
import { useTheme } from '@/hooks/useTheme';

// OpenFreeMap — 100% free, no API key required, no rate limits
const STYLE_LIGHT = 'https://tiles.openfreemap.org/styles/liberty';
const STYLE_DARK  = 'https://tiles.openfreemap.org/styles/positron';

export default function LiveMapPage() {
  const [riders, setRiders]   = useState([]);
  const [meta, setMeta]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [within, setWithin]   = useState(10);
  const { theme } = useTheme();

  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const markersRef      = useRef(new Map()); // rider.id → maplibregl.Marker

  // ---------- Fetch riders ----------
  const load = async () => {
    try {
      const r = await api.get(`/api/admin/riders/live-locations?withinMinutes=${within}`);
      setRiders(r.data.riders);
      setMeta(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [within]);

  // ---------- Initialize map (once) ----------
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: theme === 'dark' ? STYLE_DARK : STYLE_LIGHT,
      center: [CITY.lng, CITY.lat],  // ⚠️ MapLibre uses [lng, lat] order
      zoom: 12,
      attributionControl: true,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
    mapRef.current.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Switch style on theme change ----------
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(theme === 'dark' ? STYLE_DARK : STYLE_LIGHT);
    }
  }, [theme]);

  // ---------- Sync markers to riders ----------
  useEffect(() => {
    if (!mapRef.current) return;

    const seen = new Set();

    riders.forEach((r) => {
      seen.add(r.id);
      const color =
        r.status === 'online' ? '#10b981' :
        r.status === 'busy'   ? '#7c3aed' :
                                '#94a3b8';

      const popupHtml = `
        <div style="font-family:system-ui;padding:2px 4px;min-width:180px">
          <div style="font-weight:600;color:#0f172a">${escapeHtml(r.full_name)}</div>
          <div style="font-size:12px;color:#64748b;margin-top:2px">
            ${escapeHtml(r.vehicle_type)} · ${escapeHtml(r.status)}
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:2px">
            ⭐ ${Number(r.rating_avg || 0).toFixed(1)} · ${r.completed_jobs || 0} jobs
          </div>
          ${r.active_shipment ? `
            <div style="font-size:11px;color:#7c3aed;margin-top:6px;padding:4px 6px;background:#f5f3ff;border-radius:6px">
              On shipment: <b>${escapeHtml(r.active_shipment.tracking_number)}</b>
            </div>` : ''}
        </div>`;

      const existing = markersRef.current.get(r.id);
      if (existing) {
        // Smooth in-place update — no flicker
        existing.setLngLat([r.lng, r.lat]);
        existing.getPopup()?.setHTML(popupHtml);
      } else {
        const marker = new maplibregl.Marker({ color })
          .setLngLat([r.lng, r.lat])
          .setPopup(new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(popupHtml))
          .addTo(mapRef.current);
        markersRef.current.set(r.id, marker);
      }
    });

    // Remove markers for riders that dropped out of the time window
    for (const [id, marker] of markersRef.current.entries()) {
      if (!seen.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
  }, [riders]);

  return (
    <>
      <TopBar
        title="Live rider map"
        subtitle={meta ? `${meta.count} riders active in ${CITY.name} · last ${meta.within_minutes} min` : 'Loading…'}
        actions={
          <div className="flex items-center gap-2">
            <select className="input h-10 w-40" value={within} onChange={e => setWithin(Number(e.target.value))}>
              <option value={5}>Last 5 min</option>
              <option value={10}>Last 10 min</option>
              <option value={30}>Last 30 min</option>
              <option value={60}>Last 1 hour</option>
            </select>
            <button onClick={load} className="btn btn-outline"><RefreshCw className="w-4 h-4" /> Refresh</button>
          </div>
        }
      />

      <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="card overflow-hidden lg:col-span-2 h-[600px]">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Riders list */}
        <div className="card overflow-hidden h-[600px] flex flex-col">
          <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-800">
            <h3 className="font-semibold text-sm">Active riders</h3>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">Auto-refreshes every 8 seconds</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && <div className="p-4 text-sm text-ink-500 dark:text-ink-400">Loading…</div>}
            {!loading && riders.length === 0 && (
              <div className="p-6 text-center text-sm text-ink-500 dark:text-ink-400 flex flex-col items-center gap-2">
                <MapPin className="w-6 h-6 text-ink-400" />
                No riders active in the last {within} min.
              </div>
            )}
            {riders.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  mapRef.current?.flyTo({ center: [r.lng, r.lat], zoom: 15, duration: 800 });
                  markersRef.current.get(r.id)?.togglePopup();
                }}
                className="w-full text-left p-4 border-b border-ink-100 dark:border-ink-800 last:border-0 hover:bg-ink-50 dark:hover:bg-ink-800/50 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-sm">{r.full_name}</div>
                  <RiderBadge status={r.status} />
                </div>
                <div className="text-xs text-ink-500 dark:text-ink-400">{r.vehicle_type} · {r.vehicle_plate || '—'}</div>
                <div className="flex items-center gap-3 mt-2 text-xs text-ink-500 dark:text-ink-400">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {Number(r.rating_avg || 0).toFixed(1)}
                  </span>
                  <span>·</span>
                  <span>{r.completed_jobs} jobs</span>
                  <span>·</span>
                  <span>{relative(r.last_location_at)}</span>
                </div>
                {r.active_shipment && (
                  <div className="mt-2 text-xs bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-lg px-2 py-1">
                    On: {r.active_shipment.tracking_number}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Prevent XSS in popups if a rider name contains `<` etc.
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}