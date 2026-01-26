// src/pages/packing/BillingStaffPacking.jsx
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import InvoiceCard from "../../components/packing/InvoiceCard";
import { API, BILLING_TABS, toTitleCase } from "../../components/packing/packingUtils";

/* =========================
   CUSTOMER MODAL (CRUD)
========================= */
const CustomerModal = ({ open, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [values, setValues] = useState({
    customer_name: "",
    city: "",
    rep_name: "",
  });

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/customers`, { params: { q } });
      setCustomers(res.data || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert(e?.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    if (open) loadCustomers();
  }, [open, loadCustomers]);

  const openAdd = () => {
    setEditing(null);
    setValues({ customer_name: "", city: "", rep_name: "" });
    setFormOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setValues({
      customer_name: String(c.customer_name || ""),
      city: String(c.city || ""),
      rep_name: String(c.rep_name || ""),
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditing(null);
  };

  const saveCustomer = async () => {
    const customer_name = String(values.customer_name || "").trim();
    const city = String(values.city || "").trim();
    const rep_name = String(values.rep_name || "").trim();

    if (!customer_name) {
      alert("Customer name is required");
      return;
    }

    setSaving(true);
    try {
      if (editing?.customer_id) {
        await axios.put(`${API}/api/customers/${editing.customer_id}`, {
          customer_name,
          city,
          rep_name,
        });
      } else {
        await axios.post(`${API}/api/customers`, {
          customer_name,
          city,
          rep_name,
        });
      }
      setFormOpen(false);
      setEditing(null);
      await loadCustomers();
      onRefresh?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert(e?.response?.data?.message || "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = async (c) => {
    if (!window.confirm(`Delete customer "${c.customer_name}"?`)) return;
    try {
      await axios.delete(`${API}/api/customers/${c.customer_id}`);
      await loadCustomers();
      onRefresh?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert(e?.response?.data?.message || "Failed to delete customer");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 md:items-center">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">Customers</div>
            <div className="text-xs text-gray-500">Add / Edit / Delete</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-md px-2 text-sm text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search customer"
              className="h-9 flex-1 rounded-md border px-2 text-xs"
            />
            <button
              type="button"
              onClick={loadCustomers}
              className="h-9 rounded-md border px-3 text-xs hover:bg-gray-50"
            >
              Search
            </button>
            <button
              type="button"
              onClick={openAdd}
              className="h-9 rounded-md bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-700"
            >
              Add Customer
            </button>
          </div>

          {loading && <div className="mt-3 text-xs text-gray-500">Loading…</div>}

          {/* List */}
          <div className="mt-3 overflow-hidden rounded-md border">
            <div className="grid grid-cols-12 bg-gray-100 px-3 py-2 text-[11px] text-gray-700">
              <div className="col-span-5">Customer</div>
              <div className="col-span-3">City</div>
              <div className="col-span-2">Rep</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {(customers || []).length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-500">No customers</div>
            ) : (
              customers.map((c) => (
                <div key={c.customer_id} className="grid grid-cols-12 border-t px-3 py-2 text-sm">
                  <div className="col-span-5 truncate text-gray-900">
                    {toTitleCase(c.customer_name)}
                  </div>
                  <div className="col-span-3 truncate text-gray-700">{toTitleCase(c.city)}</div>
                  <div className="col-span-2 truncate text-gray-700">{toTitleCase(c.rep_name)}</div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="h-7 rounded-md border px-2 text-[11px] hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCustomer(c)}
                      className="h-7 rounded-md border border-red-200 bg-red-50 px-2 text-[11px] text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form */}
          {formOpen && (
            <div className="mt-4 rounded-lg border bg-white p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">
                  {editing ? "Edit Customer" : "Add Customer"}
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="h-8 rounded-md px-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  value={values.customer_name}
                  onChange={(e) => setValues((p) => ({ ...p, customer_name: e.target.value }))}
                  placeholder="Customer name *"
                  className="h-10 rounded-md border px-3 text-sm"
                />
                <input
                  value={values.city}
                  onChange={(e) => setValues((p) => ({ ...p, city: e.target.value }))}
                  placeholder="City"
                  className="h-10 rounded-md border px-3 text-sm"
                />
                <input
                  value={values.rep_name}
                  onChange={(e) => setValues((p) => ({ ...p, rep_name: e.target.value }))}
                  placeholder="Rep name"
                  className="h-10 rounded-md border px-3 text-sm"
                />
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={saveCustomer}
                  disabled={saving}
                  className="h-10 flex-1 rounded-md bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="h-10 flex-1 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border px-3 text-xs hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================
   ADD INVOICE MODAL (Billing)
========================= */
const AddInvoiceModal = ({ open, onClose, currentUsername, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sameCustomerInvoices, setSameCustomerInvoices] = useState([]);

  const [values, setValues] = useState({
    invoice_number: "",
    invoice_date: new Date().toISOString().slice(0, 10),
    no_of_products: "",
    invoice_value: "",
    customer_name: "",
    rep_name: "",
    courier_name: "",
  });

  const checkSameCustomer = useCallback(async () => {
    const customer = String(values.customer_name || "").trim();
    const date = String(values.invoice_date || "").trim();
    if (!customer || !date) {
      setSameCustomerInvoices([]);
      return;
    }

    setChecking(true);
    try {
      const res = await axios.get(`${API}/api/packing`, {
        params: { date, status: "ALL", search: customer },
      });

      const rows = (res.data || []).filter(
        (x) => String(x.customer_name || "").trim().toLowerCase() === customer.toLowerCase()
      );

      const invs = rows.map((r) => r.invoice_number).filter(Boolean);
      setSameCustomerInvoices(invs);
    } catch (e) {
      setSameCustomerInvoices([]);
    } finally {
      setChecking(false);
    }
  }, [values.customer_name, values.invoice_date]);

  useEffect(() => {
    if (open) {
      setSameCustomerInvoices([]);
      setValues((p) => ({ ...p, invoice_date: new Date().toISOString().slice(0, 10) }));
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => checkSameCustomer(), 400);
    return () => clearTimeout(t);
  }, [open, checkSameCustomer]);

  const save = async () => {
    const invoice_number = String(values.invoice_number || "").trim();
    const invoice_date = String(values.invoice_date || "").trim();
    const no_of_products = String(values.no_of_products || "").trim();
    const customer_name = String(values.customer_name || "").trim();
    const courier_name = String(values.courier_name || "").trim();

    if (!invoice_number || !invoice_date || !no_of_products || !customer_name || !courier_name) {
      alert("Please fill all required fields (*)");
      return;
    }

    setSaving(true);
    try {
      // IMPORTANT: This assumes you updated /packing/save to work with new statuses.
      // New invoices should start as TO_TAKE.
      await axios.post(`${API}/api/packing/create`, {
        invoice_number,
        invoice_date,
        no_of_products: Number(no_of_products),
        invoice_value: values.invoice_value === "" ? null : Number(values.invoice_value),
        customer_name,
        rep_name: String(values.rep_name || "").trim() || null,
        courier_name,
        created_by: currentUsername,
      });

      onSaved?.();
      onClose?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert(e?.response?.data?.message || e?.response?.data || "Failed to add invoice");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 md:items-center">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">Add Bills (Invoice)</div>
            <div className="text-xs text-gray-500">Billing Staff</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-md px-2 text-sm text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={values.invoice_number}
              onChange={(e) => setValues((p) => ({ ...p, invoice_number: e.target.value }))}
              placeholder="Invoice number *"
              className="h-10 rounded-md border px-3 text-sm"
            />
            <input
              type="date"
              value={values.invoice_date}
              onChange={(e) => setValues((p) => ({ ...p, invoice_date: e.target.value }))}
              className="h-10 rounded-md border px-3 text-sm"
            />

            <input
              value={values.customer_name}
              onChange={(e) => setValues((p) => ({ ...p, customer_name: e.target.value }))}
              placeholder="Customer name *"
              className="h-10 rounded-md border px-3 text-sm"
            />
            <input
              value={values.rep_name}
              onChange={(e) => setValues((p) => ({ ...p, rep_name: e.target.value }))}
              placeholder="Rep name"
              className="h-10 rounded-md border px-3 text-sm"
            />

            <input
              type="number"
              min="1"
              value={values.no_of_products}
              onChange={(e) => setValues((p) => ({ ...p, no_of_products: e.target.value }))}
              placeholder="No. of products *"
              className="h-10 rounded-md border px-3 text-sm"
            />
            <input
              type="number"
              step="0.01"
              value={values.invoice_value}
              onChange={(e) => setValues((p) => ({ ...p, invoice_value: e.target.value }))}
              placeholder="Invoice value"
              className="h-10 rounded-md border px-3 text-sm"
            />

            <input
              value={values.courier_name}
              onChange={(e) => setValues((p) => ({ ...p, courier_name: e.target.value }))}
              placeholder="Courier name *"
              className="h-10 rounded-md border px-3 text-sm md:col-span-2"
            />
          </div>

          {/* Same customer check */}
          <div className="mt-3 rounded-md border bg-gray-50 px-3 py-2 text-xs text-gray-700">
            {checking ? (
              "Checking other invoices for this customer…"
            ) : sameCustomerInvoices.length > 1 ? (
              <>
                Other invoices for this customer today:{" "}
                <span className="font-semibold">{sameCustomerInvoices.join(", ")}</span>
              </>
            ) : (
              "Tip: customer duplicates will show here automatically."
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="h-10 flex-1 rounded-md bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Invoice"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 flex-1 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>

          <div className="mt-2 text-[11px] text-gray-500">
            New invoice will start in <b>TO_TAKE</b>.
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================
   BILLING STAFF PAGE
========================= */
const BillingStaffPacking = () => {
  const { currentUser } = useContext(AuthContext);
  const currentUsername = String(currentUser?.username || "").trim();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [activeTab, setActiveTab] = useState("TO_TAKE");
  const [loading, setLoading] = useState(false);

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  const [customerOpen, setCustomerOpen] = useState(false);
  const [addInvoiceOpen, setAddInvoiceOpen] = useState(false);

  const isOutstanding = activeTab === "OUTSTANDING";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/packing`, {
        params: {
          date: selectedDate,
          status: activeTab === "ALL" || isOutstanding ? "ALL" : activeTab,
          search,
          scope: "all",
        },
      });

      const data = res.data || [];
      setRows(isOutstanding ? data.filter((x) => String(x.status) !== "PACKED") : data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Load failed", err);
      alert(err?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [activeTab, isOutstanding, search, selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  // Billing can also do actions (your server must have these endpoints)
  const startTaking = useCallback(
    async (invoice_id) => {
      await axios.post(`${API}/api/packing/start-taking`, { invoice_id, username: currentUsername });
      load();
    },
    [currentUsername, load]
  );

  const markTaken = useCallback(
    async (invoice_id) => {
      await axios.post(`${API}/api/packing/mark-taken`, { invoice_id, username: currentUsername });
      load();
    },
    [currentUsername, load]
  );

  const startVerify = useCallback(
    async (invoice_id) => {
      await axios.post(`${API}/api/packing/start-verify`, { invoice_id, username: currentUsername });
      load();
    },
    [currentUsername, load]
  );

  const markPacked = useCallback(
    async (invoice_id) => {
      await axios.post(`${API}/api/packing/mark-packed`, { invoice_id, username: currentUsername });
      load();
    },
    [currentUsername, load]
  );

  const tabLabel = useMemo(() => {
    const t = BILLING_TABS.find((x) => x.key === activeTab);
    return t?.label || activeTab;
  }, [activeTab]);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Packing</h1>
          <div className="text-xs text-gray-500">Billing Staff</div>
        </div>
        <div className="text-xs text-gray-600">{toTitleCase(currentUsername) || "-"}</div>
      </div>

      {/* Top actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCustomerOpen(true)}
          className="h-9 rounded-md border px-3 text-xs hover:bg-gray-50"
        >
          Customer (Add / Edit / Delete)
        </button>

        <button
          type="button"
          onClick={() => setAddInvoiceOpen(true)}
          className="h-9 rounded-md bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-700"
        >
          Add Bills
        </button>

        <div className="ml-auto flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 rounded-md border px-2 text-xs"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice / customer"
            className="h-9 w-56 rounded-md border px-2 text-xs"
          />
          <button
            type="button"
            onClick={load}
            className="h-9 rounded-md border px-3 text-xs hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 w-full overflow-x-auto">
        <div className="inline-flex min-w-max rounded-md border bg-white">
          {BILLING_TABS.filter((t) => t.key !== "UNPRINTED").map((t, idx) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={[
                  "px-3 py-2 text-xs whitespace-nowrap transition",
                  idx !== 0 ? "border-l" : "",
                  active ? "bg-teal-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        Showing: <span className="font-semibold">{tabLabel}</span>
      </div>

      {loading && <div className="mt-3 text-xs text-gray-500">Loading…</div>}

      {/* List */}
      <div className="mt-4 space-y-3">
        {!loading && rows.length === 0 && (
          <div className="rounded-md border bg-white p-3 text-xs text-gray-500">No bills found</div>
        )}

        {rows.map((it) => (
          <InvoiceCard
            key={it.invoice_id}
            it={it}
            mode={
              it.status === "TO_TAKE"
                ? "TO_TAKE"
                : it.status === "TO_VERIFY"
                ? "TO_VERIFY"
                : it.status === "TAKING" || it.status === "VERIFYING"
                ? "MY_JOB"
                : "ALL"
            }
            currentUsername={currentUsername}
            onStartTaking={startTaking}
            onMarkTaken={markTaken}
            onStartVerify={startVerify}
            onMarkPacked={markPacked}
          />
        ))}
      </div>

      {/* Modals */}
      <CustomerModal
        open={customerOpen}
        onClose={() => setCustomerOpen(false)}
        onRefresh={load}
      />

      <AddInvoiceModal
        open={addInvoiceOpen}
        onClose={() => setAddInvoiceOpen(false)}
        currentUsername={currentUsername}
        onSaved={load}
      />
    </div>
  );
};

export default BillingStaffPacking;
