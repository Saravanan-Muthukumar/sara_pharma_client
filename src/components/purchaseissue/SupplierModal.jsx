import { useEffect, useMemo, useState } from "react";
import { toTitleCase } from "../packing/packingUtils";
import { useSuppliers } from "../../hooks/useSuppliers";

const SupplierModal = ({ open, onClose, onRefresh }) => {
  const { loading, suppliers, error, load, save, remove } = useSuppliers();

  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    supplier_name: "",
    city: "",
  });

  useEffect(() => {
    setErrors({});
    if (!open) return;

    load("");
    setQ("");
    setFormOpen(false);
    setEditing(null);
    setValues({
      supplier_name: "",
      city: "",
    });
  }, [open, load]);

  const openAdd = () => {
    setErrors({});
    setEditing(null);
    setValues({
      supplier_name: "",
      city: "",
    });
    setFormOpen(true);
  };

  const openEdit = (s) => {
    setErrors({});
    setEditing(s);

    setValues({
      supplier_name: String(s.supplier_name || ""),
      city: String(s.city || ""),
    });

    setFormOpen(true);
  };

  const closeForm = () => {
    setErrors({});
    if (saving) return;

    setFormOpen(false);
    setEditing(null);
  };

  const validate = () => {
    const next = {};

    if (!String(values.supplier_name || "").trim())
      next.supplier_name = "Supplier name required";

    if (!String(values.city || "").trim())
      next.city = "City name is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;

    const supplier_name = toTitleCase(values.supplier_name);
    const city = toTitleCase(values.city);

    setSaving(true);

    try {
      await save({
        supplier_id: editing?.supplier_id,
        ...values,
        supplier_name,
        city,
      });

      setFormOpen(false);
      setEditing(null);

      await load(q);
      onRefresh?.();
    } catch (e) {
      alert(e?.message || "Failed to save supplier");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (s) => {
    if (!window.confirm(`Delete supplier "${s.supplier_name}"?`)) return;

    try {
      await remove(s.supplier_id);
      await load(q);
      onRefresh?.();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete supplier");
    }
  };

  const list = useMemo(() => suppliers || [], [suppliers]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 md:items-center">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-lg">

        {/* Header */}

        <div className="shrink-0 border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Suppliers
              </div>
              <div className="text-xs text-gray-500">
                Add / Edit / Delete
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 rounded-md px-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}

        <div className="flex flex-col gap-3 overflow-hidden px-4 py-3">

          {/* Search */}

          <div className="flex items-center gap-2 shrink-0">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search supplier"
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
              Add Supplier
            </button>
          </div>

          {error && (
            <div className="text-xs text-red-600">{error}</div>
          )}

          {loading && (
            <div className="text-xs text-gray-500">Loading…</div>
          )}

          {/* List */}

          <div className="flex-1 overflow-y-auto rounded-md border">

            <div className="grid grid-cols-12 bg-gray-100 px-3 py-2 text-[11px] text-gray-700 sticky top-0">
              <div className="col-span-7">Supplier</div>
              <div className="col-span-3">City</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {list.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-500">
                No suppliers
              </div>
            ) : (
              list.map((s) => (
                <div
                  key={s.supplier_id}
                  className="grid grid-cols-12 border-t px-3 py-2 text-sm"
                >
                  <div className="col-span-7 truncate text-gray-900">
                    {toTitleCase(s.supplier_name)}
                  </div>

                  <div className="col-span-3 truncate text-gray-700">
                    {toTitleCase(s.city)}
                  </div>

                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="h-7 rounded-md border px-2 text-[11px] hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(s)}
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
            <div className="rounded-lg border bg-white p-3">

              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">
                  {editing ? "Edit Supplier" : "Add Supplier"}
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  className="h-8 rounded-md px-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">

                <div>
                  <input
                    value={values.supplier_name}
                    onChange={(e) => {
                      setValues((p) => ({
                        ...p,
                        supplier_name: e.target.value,
                      }));

                      if (errors.supplier_name)
                        setErrors((p) => {
                          const copy = { ...p };
                          delete copy.supplier_name;
                          return copy;
                        });
                    }}
                    placeholder="Supplier name *"
                    className={[
                      "h-10 w-full rounded-md border px-3 text-sm",
                      errors.supplier_name
                        ? "border-red-500"
                        : "focus:border-teal-600",
                    ].join(" ")}
                  />

                  <div className="mt-1 text-xs text-red-600">
                    {errors.supplier_name || ""}
                  </div>
                </div>

                <div>
                  <input
                    value={values.city}
                    onChange={(e) => {
                      setValues((p) => ({
                        ...p,
                        city: e.target.value,
                      }));

                      if (errors.city)
                        setErrors((p) => {
                          const copy = { ...p };
                          delete copy.city;
                          return copy;
                        });
                    }}
                    placeholder="City *"
                    className={[
                      "h-10 w-full rounded-md border px-3 text-sm",
                      errors.city
                        ? "border-red-500"
                        : "focus:border-teal-600",
                    ].join(" ")}
                  />

                  <div className="mt-1 text-xs text-red-600">
                    {errors.city || ""}
                  </div>
                </div>

              </div>

              <div className="mt-3 flex gap-2">

                <button
                  onClick={onSave}
                  disabled={saving}
                  className="h-10 flex-1 rounded-md bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  {saving ? "Saving…" : "Save"}
                </button>

                <button
                  onClick={closeForm}
                  className="h-10 flex-1 rounded-md border text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>

              </div>

            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => {
                setErrors({});
                onClose();
              }}
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

export default SupplierModal;