// src/components/packing/customers/CustomerModal.jsx
import { useEffect, useMemo, useState } from "react";
import { toTitleCase } from "./packingUtils";
import { useCustomers } from "../../hooks/useCustomers";
import { useUsers } from "../../hooks/useUsers";
import RepSelect from "./RepSelect";

const CustomerModal = ({ open, onClose, onRefresh }) => {
  const { loading, customers, error, load, save, remove } = useCustomers();

  const [q, setQ] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const { users } = useUsers({ open });

  const [values, setValues] = useState({
    customer_name: "",
    city: "",
    rep_name: "",
    courier_name: "",
  });

  useEffect(() => {
    if (!open) return;
    load("");
    setQ("");
    setFormOpen(false);
    setEditing(null);
    setValues({ customer_name: "", city: "", rep_name: "", courier_name: "" });
  }, [open, load]);

  const openAdd = () => {
    setEditing(null);
    setValues({ customer_name: "", city: "", rep_name: "", courier_name: "" });
    setFormOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setValues({
      customer_name: String(c.customer_name || ""),
      city: String(c.city || ""),
      rep_name: String(c.rep_name || ""),
      courier_name: String(c.courier_name || ""),
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditing(null);
  };

  const onSave = async () => {
    const customer_name = toTitleCase(values.customer_name);
    const city = toTitleCase(values.city);
  
    if (!customer_name.trim()) {
      alert("Customer name is required");
      return;
    }
  
    setSaving(true);
    try {
      await save({
        customer_id: editing?.customer_id,
        ...values,
        customer_name,
        city,
      });
      setFormOpen(false);
      setEditing(null);
      await load(q);
      onRefresh?.();
    } catch (e) {
      alert(e?.message || "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (c) => {
    if (!window.confirm(`Delete customer "${c.customer_name}"?`)) return;
    try {
      await remove(c.customer_id);
      await load(q);
      onRefresh?.();
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e?.response?.data?.message || "Failed to delete customer");
    }
  };

  const list = useMemo(() => customers || [], [customers]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 md:items-center">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-lg flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
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

        <div className="px-4 py-3 flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search customer"
              className="h-9 flex-1 rounded-md border px-2 text-xs"
            />
            <button
              type="button"
              onClick={() => load(q)}
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
          {error && <div className="text-xs text-red-600 shrink-0">{error}</div>}
          {loading && <div className="text-xs text-gray-500 shrink-0">Loading…</div>}

          <div className="flex-1 overflow-y-auto rounded-md border">
            <div className="grid grid-cols-12 bg-gray-100 px-3 py-2 text-[11px] text-gray-700 sticky top-0">
              <div className="col-span-4">Customer</div>
              <div className="col-span-2">City</div>
              <div className="col-span-2">Rep</div>
              <div className="col-span-2">Courier</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {list.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-500">No customers</div>
            ) : list.map((c) => (
                <div key={c.customer_id} className="grid grid-cols-12 border-t px-3 py-2 text-sm">
                  <div className="col-span-4 truncate text-gray-900">{toTitleCase(c.customer_name)}</div>
                  <div className="col-span-2 truncate text-gray-700">{toTitleCase(c.city)}</div>
                  <div className="col-span-2 truncate text-gray-700">{toTitleCase(c.rep_name)}</div>
                  <div className="col-span-2 truncate text-gray-700">{toTitleCase(c.courier_name)}</div>
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
                      onClick={() => onDelete(c)}
                      className="h-7 rounded-md border border-red-200 bg-red-50 px-2 text-[11px] text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            }
          </div>

          {formOpen && (
            <div className="rounded-lg border bg-white p-3 shrink-0">
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

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
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
                  {/* ✅ Rep from users table */}
                <RepSelect
                    users={users}
                    value={values.rep_name}
                    onChange={(v) => setValues((p) => ({ ...p, rep_name: v }))}
                    roleFilter="billing"   // or null if you want all
                />
               {/* ✅ Courier dropdown (Local/ST/blank) */}
                {/* <CourierSelect
                    value={values.courier_name}
                    onChange={(v) => setValues((p) => ({ ...p, courier_name: v }))}
                /> */}
                <select
                    value={values.courier_name}
                    onChange={(e) => e.target.value}
                    className="h-10 rounded-md border px-3 text-sm outline-none focus:border-teal-600"
                  >
                    <option value="ST">ST</option>
                    <option value="Professional">Professional</option>
                    <option value="Local">Local</option>
                    
                  </select>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={onSave}
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

          <div className="flex justify-end shrink-0">
            <button type="button" onClick={onClose} className="h-9 rounded-md border px-3 text-xs hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
