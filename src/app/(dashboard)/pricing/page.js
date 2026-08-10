"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Check,
  Trash2,
  DollarSign,
  Tag,
  Route,
  Info,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import Modal from "@/components/Modal";
import { Chip } from "@/components/Badge";
import { api } from "@/lib/api";
import { money, dateShort, CITY } from "@/lib/format";

const TABS = [
  {
    key: "configs",
    label: "Pricing configs",
    icon: DollarSign,
    help: "Global fare formula: base + per-km + per-kg + surge + tax. Only one active at a time.",
  },
  {
    key: "discounts",
    label: "Discount codes",
    icon: Tag,
    help: "Promo codes customers enter at checkout. Percent (e.g. 15% off) or fixed (e.g. −1,000 RWF).",
  },
  {
    key: "routes",
    label: "Route overrides",
    icon: Route,
    help: "City-pair flat prices that override the standard fare (e.g. Kigali → Musanze at 4,500 RWF).",
  },
];

export default function PricingPage() {
  const [tab, setTab] = useState("configs");
  const activeTab = TABS.find((t) => t.key === tab);

  return (
    <>
      <TopBar
        title="Pricing"
        subtitle={`Configure how delivery prices are calculated in ${CITY.name}.`}
      />
      <div className="px-8 py-6 space-y-4">
        <div className="flex gap-2 border-b border-ink-100 dark:border-ink-800">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                tab === t.key
                  ? "border-brand-600 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {activeTab?.help && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-50/60 dark:bg-brand-900/20 text-brand-800 dark:text-brand-200 text-sm">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{activeTab.help}</div>
          </div>
        )}

        {tab === "configs" && <PricingConfigs />}
        {tab === "discounts" && <Discounts />}
        {tab === "routes" && <RouteOverrides />}
      </div>
    </>
  );
}

// ---- Pricing configs ----
function PricingConfigs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const empty = {
    name: "",
    currency: "RWF",
    base_fare: 2000,
    price_per_km: 200,
    price_per_kg: 0,
    price_per_minute: 0,
    min_price: 2000,
    max_price: "",
    free_km: 0,
    surge_multiplier: 1.0,
    tax_percentage: 0,
    rider_commission_percentage: 30,
    moto_commission_percentage: 40,
    is_active: true,
  };
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/api/admin/pricing/configs");
      setRows(r.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setErr("");
    try {
      const body = { ...form };
      if (body.max_price === "") delete body.max_price;
      await api.post("/api/admin/pricing/configs", body);
      setOpen(false);
      setForm(empty);
      load();
    } catch (e) {
      setErr(e.message);
    }
  };
  const activate = async (id) => {
    await api.patch(`/api/admin/pricing/configs/${id}`, { is_active: true });
    load();
  };

  return (
    <>
      <div className="flex justify-end">
        <button onClick={() => setOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> New config
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {loading && (
          <div className="col-span-full text-sm text-ink-500 dark:text-ink-400">
            Loading…
          </div>
        )}
        {rows.map((c) => (
          <div
            key={c.id}
            className={`card p-5 ${c.is_active ? "ring-2 ring-brand-500" : ""}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                  {c.currency} · updated {dateShort(c.updated_at)}
                </div>
              </div>
              {c.is_active ? (
                <Chip tone="brand">Active</Chip>
              ) : (
                <button
                  onClick={() => activate(c.id)}
                  className="btn btn-outline text-xs py-1"
                >
                  <Check className="w-3 h-3" /> Activate
                </button>
              )}
            </div>
            <dl className="text-sm space-y-1 mt-3">
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">Base fare</dt>
                <dd className="font-medium">
                  {money(c.base_fare, c.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">Per km</dt>
                <dd className="font-medium">
                  {money(c.price_per_km, c.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">Per kg</dt>
                <dd className="font-medium">
                  {money(c.price_per_kg, c.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">Min price</dt>
                <dd className="font-medium">
                  {money(c.min_price, c.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">Surge</dt>
                <dd className="font-medium">
                  ×{Number(c.surge_multiplier).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">Tax</dt>
                <dd className="font-medium">{c.tax_percentage}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">
                  Rider commission
                </dt>
                <dd className="font-medium">
                  {c.rider_commission_percentage}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">
                  Bike commission
                </dt>
                <dd className="font-medium">{c.moto_commission_percentage}%</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New pricing config"
        size="lg"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn btn-ghost">
              Cancel
            </button>
            <button onClick={create} className="btn btn-primary">
              Create
            </button>
          </>
        }
      >
        {err && (
          <div className="mb-3 p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm rounded-lg">
            {err}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Name *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Kigali 2026 Q3"
            />
          </div>
          <div>
            <label className="label">Currency</label>
            <input
              className="input"
              value={form.currency}
              onChange={(e) =>
                setForm({ ...form, currency: e.target.value.toUpperCase() })
              }
            />
          </div>
          <div>
            <label className="label">Base fare</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.base_fare}
              onChange={(e) =>
                setForm({ ...form, base_fare: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="label">Price per km</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.price_per_km}
              onChange={(e) =>
                setForm({ ...form, price_per_km: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="label">Price per kg</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.price_per_kg}
              onChange={(e) =>
                setForm({ ...form, price_per_kg: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="label">Free km</label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={form.free_km}
              onChange={(e) =>
                setForm({ ...form, free_km: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="label">Min price</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.min_price}
              onChange={(e) =>
                setForm({ ...form, min_price: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="label">Surge multiplier</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.surge_multiplier}
              onChange={(e) =>
                setForm({ ...form, surge_multiplier: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="label">Tax %</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.tax_percentage}
              onChange={(e) =>
                setForm({ ...form, tax_percentage: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="label">Rider commission %</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.rider_commission_percentage}
              onChange={(e) =>
                setForm({
                  ...form,
                  rider_commission_percentage: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="label">Motobike commission %</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.moto_commission_percentage}
              onChange={(e) =>
                setForm({
                  ...form,
                  moto_commission_percentage: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="col-span-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              <span className="text-sm">
                Make active (deactivates any other active config)
              </span>
            </label>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ---- Discounts ----
function Discounts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const empty = {
    code: "",
    description: "",
    discount_type: "percent",
    amount: 10,
    max_uses: "",
    is_active: true,
  };
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/api/admin/pricing/discounts?pageSize=100");
      setRows(r.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setErr("");
    try {
      const body = { ...form };
      if (body.max_uses === "") delete body.max_uses;
      else body.max_uses = Number(body.max_uses);
      body.amount = Number(body.amount);
      await api.post("/api/admin/pricing/discounts", body);
      setOpen(false);
      setForm(empty);
      load();
    } catch (e) {
      setErr(e.message);
    }
  };
  const remove = async (id) => {
    if (confirm("Delete this discount?")) {
      await api.del(`/api/admin/pricing/discounts/${id}`);
      load();
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <button onClick={() => setOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> New discount
        </button>
      </div>
      <div className="card overflow-hidden mt-4">
        {loading ? (
          <div className="p-6 text-sm text-ink-500 dark:text-ink-400">
            Loading…
          </div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
                <th>Uses</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="font-mono font-medium text-brand-600 dark:text-brand-400">
                      {d.code}
                    </div>
                    <div className="text-xs text-ink-500 dark:text-ink-400">
                      {d.description || "—"}
                    </div>
                  </td>
                  <td className="capitalize">{d.discount_type}</td>
                  <td className="text-right font-medium">
                    {d.discount_type === "percent"
                      ? `${d.amount}%`
                      : money(d.amount)}
                  </td>
                  <td className="text-xs">
                    {d.used_count || 0}
                    {d.max_uses ? ` / ${d.max_uses}` : ""}
                  </td>
                  <td className="text-xs">
                    {d.is_active ? (
                      <Chip tone="emerald">Active</Chip>
                    ) : (
                      <Chip>Inactive</Chip>
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => remove(d.id)}
                      className="btn btn-ghost text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="p-6 text-sm text-ink-500 dark:text-ink-400 text-center"
                  >
                    No discount codes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New discount code"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn btn-ghost">
              Cancel
            </button>
            <button onClick={create} className="btn btn-primary">
              Create
            </button>
          </>
        }
      >
        {err && (
          <div className="mb-3 p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm rounded-lg">
            {err}
          </div>
        )}
        <div className="space-y-3">
          <div>
            <label className="label">Code *</label>
            <input
              className="input font-mono uppercase"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              placeholder="MURAHO10"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <input
              className="input"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Welcome discount for new customers"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={form.discount_type}
                onChange={(e) =>
                  setForm({ ...form, discount_type: e.target.value })
                }
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (RWF)</option>
              </select>
            </div>
            <div>
              <label className="label">Amount</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Max uses (optional)</label>
            <input
              type="number"
              className="input"
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              placeholder="Leave blank for unlimited"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

// ---- Route overrides ----
function RouteOverrides() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const empty = {
    origin_city: "Kigali",
    destination_city: "Musanze",
    flat_price: 4500,
    currency: "RWF",
    is_active: true,
  };
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/api/admin/pricing/routes");
      setRows(r.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setErr("");
    try {
      await api.post("/api/admin/pricing/routes", {
        ...form,
        flat_price: Number(form.flat_price),
      });
      setOpen(false);
      setForm(empty);
      load();
    } catch (e) {
      setErr(e.message);
    }
  };
  const remove = async (id) => {
    if (confirm("Delete this route override?")) {
      await api.del(`/api/admin/pricing/routes/${id}`);
      load();
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <button onClick={() => setOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> New route
        </button>
      </div>
      <div className="card overflow-hidden mt-4">
        {loading ? (
          <div className="p-6 text-sm text-ink-500 dark:text-ink-400">
            Loading…
          </div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th>Origin → Destination</th>
                <th className="text-right">Flat price</th>
                <th>Currency</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">
                    {r.origin_city} → {r.destination_city}
                  </td>
                  <td className="text-right font-medium">
                    {money(r.flat_price, r.currency)}
                  </td>
                  <td>{r.currency}</td>
                  <td>
                    {r.is_active ? (
                      <Chip tone="emerald">Active</Chip>
                    ) : (
                      <Chip>Inactive</Chip>
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => remove(r.id)}
                      className="btn btn-ghost text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-6 text-sm text-ink-500 dark:text-ink-400 text-center"
                  >
                    No route overrides yet. Suggested: Kigali → Musanze, Kigali
                    → Huye, Kigali → Rubavu, Kigali → Rusizi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New route override"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn btn-ghost">
              Cancel
            </button>
            <button onClick={create} className="btn btn-primary">
              Create
            </button>
          </>
        }
      >
        {err && (
          <div className="mb-3 p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm rounded-lg">
            {err}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Origin city *</label>
            <input
              className="input"
              value={form.origin_city}
              onChange={(e) =>
                setForm({ ...form, origin_city: e.target.value })
              }
              placeholder="e.g. Kigali"
            />
          </div>
          <div>
            <label className="label">Destination city *</label>
            <input
              className="input"
              value={form.destination_city}
              onChange={(e) =>
                setForm({ ...form, destination_city: e.target.value })
              }
              placeholder="e.g. Musanze"
            />
          </div>
          <div>
            <label className="label">Flat price</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.flat_price}
              onChange={(e) => setForm({ ...form, flat_price: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Currency</label>
            <input
              className="input"
              value={form.currency}
              onChange={(e) =>
                setForm({ ...form, currency: e.target.value.toUpperCase() })
              }
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
