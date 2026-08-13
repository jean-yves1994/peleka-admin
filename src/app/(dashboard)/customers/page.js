"use client";
import { useEffect, useState, useCallback } from "react";
import { UserCircle, Crown, Wallet, Pencil } from "lucide-react";
import TopBar from "@/components/TopBar";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Chip } from "@/components/Badge";
import { api } from "@/lib/api";
import { money, dateShort } from "@/lib/format";

export default function CustomersPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0 });
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [billing, setBilling] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [customerType, setCustomerType] = useState("standard");
  const [creditLimit, setCreditLimit] = useState("0");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, pageSize: 20 });
      if (q) p.set("q", q);
      const r = await api.get(`/api/admin/customers?${p.toString()}`);
      setRows(r.data);
      setMeta(r.meta);
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => { load(); }, [load]);

  const openCustomer = async (customer) => {
    setSelected(customer);
    setBilling(null);
    setErr("");
    setCustomerType(customer.customer_type || (customer.contract_customer ? "premier" : "standard"));
    setCreditLimit(String(customer.credit_limit ?? 0));
    setDetailLoading(false);
    setBillingLoading(true);
    try {
      const r = await api.get(`/api/admin/customers/${customer.id}/billing`);
      setBilling(r.data);
      const c = r.data?.customer;
      if (c) {
        setCustomerType(c.customer_type || (c.contract_customer ? "premier" : "standard"));
        setCreditLimit(String(c.credit_limit ?? 0));
        setSelected(c);
      }
    } catch (e) {
      setErr(e.message || "Failed to load customer billing");
    } finally {
      setBillingLoading(false);
    }
  };

  const saveAccount = async () => {
    if (!selected) return;
    setSaving(true);
    setErr("");
    try {
      await api.patch(`/api/admin/customers/${selected.id}`, {
        customer_type: customerType,
        credit_limit: Number(creditLimit || 0),
      });
      await load();
      setBillingLoading(true);
      try {
        const r = await api.get(`/api/admin/customers/${selected.id}/billing`);
        setBilling(r.data);
        if (r.data?.customer) setSelected(r.data.customer);
      } catch (e) {
        // The account update already succeeded. Keep the modal open and
        // report only the billing-refresh failure.
        setErr(e.message || "Customer updated, but billing could not be refreshed");
      } finally {
        setBillingLoading(false);
      }
    } catch (e) {
      setErr(e.message || "Failed to update customer account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TopBar title="Customers" subtitle={`${meta.total} customers`} />
      <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6 space-y-4">
        <div className="card p-4">
          <label className="label">Search</label>
          <input
            className="input max-w-md"
            placeholder="Name, email or phone…"
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
          />
        </div>
        <div className="card overflow-hidden">
          {loading ? <div className="p-8 text-sm text-ink-500 dark:text-ink-400">Loading customers…</div>
            : rows.length === 0 ? <EmptyState icon={UserCircle} title="No customers found" subtitle="Customers sign up through the mobile app." />
            : (
              <>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead><tr>
                      <th>Customer</th><th>Contact</th><th>Account</th>
                      <th className="text-right">Shipments</th><th className="text-right">Outstanding</th>
                      <th>Joined</th><th className="text-right">Action</th>
                    </tr></thead>
                    <tbody>
                      {rows.map(c => {
                        const premier = c.customer_type === "premier" || c.contract_customer;
                        return (
                          <tr key={c.id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white grid place-items-center text-xs font-semibold">
                                  {(c.full_name || "?").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium">{c.full_name}</div>
                                  <div className="text-xs text-ink-500 dark:text-ink-400">{c.status}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-sm"><div>{c.email || "—"}</div><div className="text-xs text-ink-500 dark:text-ink-400">{c.phone || "—"}</div></td>
                            <td>
                              {premier ? <Chip tone="amber"><Crown className="h-3 w-3 mr-1" />Premier</Chip> : <Chip tone="slate">Standard</Chip>}
                            </td>
                            <td className="text-right tabular-nums font-medium">{c.shipment_count || 0}</td>
                            <td className="text-right tabular-nums font-medium">{premier ? money(c.outstanding_balance || 0, "RWF") : "—"}</td>
                            <td className="text-xs text-ink-500 dark:text-ink-400">{dateShort(c.created_at)}</td>
                            <td className="text-right"><button className="btn btn-outline text-xs py-1" onClick={() => openCustomer(c)}><Pencil className="h-3 w-3" /> Manage</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination page={meta.page} pageSize={meta.pageSize} total={meta.total} onChange={setPage} />
              </>
            )}
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Customer · ${selected.full_name}` : "Customer"}
        size="lg"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            <button className="btn btn-primary" disabled={saving || detailLoading} onClick={saveAccount}>{saving ? "Saving…" : "Save account"}</button>
          </>
        }
      >
        {detailLoading ? <div className="py-8 text-sm text-ink-500">Loading customer…</div> : (
          <div className="space-y-5">
            {err && <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm dark:bg-rose-900/30 dark:text-rose-300">{err}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="card p-4"><div className="text-xs text-ink-500">Account</div><div className="mt-1 font-semibold capitalize">{customerType}</div></div>
              <div className="card p-4"><div className="text-xs text-ink-500">Outstanding</div><div className="mt-1 font-semibold">{money(billing?.outstanding_balance || 0, "RWF")}</div>{billingLoading && <div className="mt-1 text-[11px] text-ink-400">Refreshing…</div>}</div>
              <div className="card p-4"><div className="text-xs text-ink-500">Credit limit</div><div className="mt-1 font-semibold">{money(creditLimit || 0, "RWF")}</div></div>
            </div>
            <div>
              <label className="label">Customer type</label>
              <select className="input" value={customerType} onChange={(e) => setCustomerType(e.target.value)}>
                <option value="standard">Standard</option>
                <option value="premier">Premier</option>
              </select>
              <p className="mt-1 text-xs text-ink-500">Premier customers may have shipments dispatched before payment and are billed later.</p>
            </div>
            <div>
              <label className="label">Approved credit limit (RWF)</label>
              <input className="input" type="number" min="0" step="1" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2"><Wallet className="h-4 w-4" /><h3 className="font-semibold">Shipment billing history</h3></div>
              <div className="max-h-64 overflow-auto rounded-lg border border-ink-100 dark:border-ink-800">
                {billingLoading && !billing ? <div className="p-4 text-sm text-ink-500">Loading billing history…</div> : billing?.shipments?.length ? billing.shipments.map(s => (
                  <div key={s.id} className="flex items-center justify-between gap-3 p-3 border-b last:border-0 border-ink-100 dark:border-ink-800 text-sm">
                    <div><div className="font-medium">{s.tracking_number}</div><div className="text-xs text-ink-500">{s.status}</div></div>
                    <div className="text-right"><div className="font-medium">{money(s.total_price, s.currency)}</div><div className="text-xs text-ink-500">{s.payment_status}</div></div>
                  </div>
                )) : <div className="p-4 text-sm text-ink-500">No shipment history.</div>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
