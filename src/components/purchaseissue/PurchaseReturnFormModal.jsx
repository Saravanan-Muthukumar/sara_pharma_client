import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API, toTitleCase } from "../packing/packingUtils";

const emptyForm = {
  purchase_return_no: "",
  purchase_return_date: "",
  supplier_id: "",
  purchase_return_amount: "",
  supplier_sales_return_no: "",
  supplier_sales_return_amount: "",
  supplier_sales_return_date: "",
  courier_name: "",
  tracking_number: "",
  recorded_by: "",
  status: "STOCK_SENT_IN_COURIER",
  remarks: "",
};

const statusOptions = [
  "STOCK_SENT_IN_COURIER",
  "STOCK_RETURNED_TO_SALESMAN",
  "STOCK_RECEIVED_BY_SUPPLIER",
  "PURCHASE_RETURN_RECEIVED",
];

const PurchaseReturnFormModal = ({ open, onClose, onSaved, editing, suppliers }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editing) {
      setForm({
        purchase_return_no: String(editing.purchase_return_no || ""),
        purchase_return_date: editing.purchase_return_date
          ? String(editing.purchase_return_date).slice(0, 10)
          : "",
        supplier_id: String(editing.supplier_id || ""),
        purchase_return_amount: String(editing.purchase_return_amount ?? ""),
        supplier_sales_return_no: String(editing.supplier_sales_return_no || ""),
        supplier_sales_return_amount: String(editing.supplier_sales_return_amount ?? ""),
        supplier_sales_return_date: editing.supplier_sales_return_date
          ? String(editing.supplier_sales_return_date).slice(0, 10)
          : "",
        courier_name: String(editing.courier_name || ""),
        tracking_number: String(editing.tracking_number || ""),
        recorded_by: String(editing.recorded_by || ""),
        status: String(editing.status || "STOCK_SENT_IN_COURIER"),
        remarks: String(editing.remarks || ""),
      });
    } else {
      setForm({
        ...emptyForm,
        recorded_by: "Admin",
      });
    }

    setErrors({});
  }, [open, editing]);

  const billDifference = useMemo(() => {
    const a = Number(form.purchase_return_amount || 0);
    const b = Number(form.supplier_sales_return_amount || 0);
    return a - b;
  }, [form.purchase_return_amount, form.supplier_sales_return_amount]);

  if (!open) return null;

  const validate = () => {
    const next = {};

    if (!String(form.purchase_return_no || "").trim()) {
      next.purchase_return_no = "Return number required";
    }

    if (!String(form.purchase_return_date || "").trim()) {
      next.purchase_return_date = "Return date required";
    }

    if (!String(form.supplier_id || "").trim()) {
      next.supplier_id = "Select supplier";
    }

    if (
      form.purchase_return_amount === "" ||
      !Number.isFinite(Number(form.purchase_return_amount)) ||
      Number(form.purchase_return_amount) < 0
    ) {
      next.purchase_return_amount = "Enter valid return amount";
    }

    if (
      form.supplier_sales_return_amount !== "" &&
      (!Number.isFinite(Number(form.supplier_sales_return_amount)) ||
        Number(form.supplier_sales_return_amount) < 0)
    ) {
      next.supplier_sales_return_amount = "Enter valid supplier return amount";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;

    const payload = {
      purchase_return_no: String(form.purchase_return_no || "").trim(),
      purchase_return_date: String(form.purchase_return_date || "").trim(),
      supplier_id: Number(form.supplier_id),
      purchase_return_amount: Number(form.purchase_return_amount),
      supplier_sales_return_no: String(form.supplier_sales_return_no || "").trim() || null,
      supplier_sales_return_amount:
        form.supplier_sales_return_amount === ""
          ? null
          : Number(form.supplier_sales_return_amount),
      supplier_sales_return_date:
        String(form.supplier_sales_return_date || "").trim() || null,
      courier_name: String(form.courier_name || "").trim() || null,
      tracking_number: String(form.tracking_number || "").trim() || null,
      recorded_by: String(form.recorded_by || "").trim() || null,
      status: String(form.status || "STOCK_SENT_IN_COURIER").trim(),
      remarks: String(form.remarks || "").trim() || null,
    };

    try {
      setSaving(true);

      if (editing?.purchase_return_id) {
        await axios.put(
          `${API}/api/purchase-returns/${editing.purchase_return_id}`,
          payload
        );
      } else {
        await axios.post(`${API}/api/purchase-returns`, payload);
      }

      onSaved?.();
      onClose?.();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to save purchase return");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 md:items-center">
      <div className="w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {editing ? "Edit Purchase Return" : "Add Purchase Return"}
              </div>
              <div className="text-xs text-gray-500">
                Save purchase return details
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

        <div className="max-h-[75vh] overflow-y-auto px-4 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <FormField
              label="Purchase Return No"
              error={errors.purchase_return_no}
              input={
                <input
                  value={form.purchase_return_no}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, purchase_return_no: e.target.value }))
                  }
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Purchase Return Date"
              error={errors.purchase_return_date}
              input={
                <input
                  type="date"
                  value={form.purchase_return_date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, purchase_return_date: e.target.value }))
                  }
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Supplier"
              error={errors.supplier_id}
              input={
                <select
                  value={form.supplier_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, supplier_id: e.target.value }))
                  }
                  className="h-10 w-full rounded-md border px-3 text-sm"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.supplier_id} value={s.supplier_id}>
                      {toTitleCase(s.supplier_name)}
                    </option>
                  ))}
                </select>
              }
            />

            <FormField
              label="Purchase Return Amount"
              error={errors.purchase_return_amount}
              input={
                <input
                  value={form.purchase_return_amount}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      purchase_return_amount: e.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Supplier Sales Return No"
              input={
                <input
                  value={form.supplier_sales_return_no}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      supplier_sales_return_no: e.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Supplier Sales Return Amount"
              error={errors.supplier_sales_return_amount}
              input={
                <input
                  value={form.supplier_sales_return_amount}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      supplier_sales_return_amount: e.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Supplier Sales Return Date"
              input={
                <input
                  type="date"
                  value={form.supplier_sales_return_date}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      supplier_sales_return_date: e.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Courier Name"
              input={
                <input
                  value={form.courier_name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, courier_name: e.target.value }))
                  }
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Tracking Number"
              input={
                <input
                  value={form.tracking_number}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tracking_number: e.target.value }))
                  }
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Recorded By"
              input={
                <input
                  value={form.recorded_by}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, recorded_by: e.target.value }))
                  }
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Status"
              input={
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.value }))
                  }
                  className="h-10 w-full rounded-md border px-3 text-sm"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              }
            />

            <div className="rounded-md border bg-gray-50 px-3 py-2">
              <div className="text-xs font-medium text-gray-600">
                Bill Amount Difference
              </div>
              <div className={billDifference !== 0 ? "text-lg font-bold text-red-600" : "text-lg font-bold text-green-700"}>
                {billDifference}
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Remarks
              </label>
              <textarea
                value={form.remarks}
                onChange={(e) =>
                  setForm((p) => ({ ...p, remarks: e.target.value }))
                }
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="border-t px-4 py-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="h-10 flex-1 rounded-md bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
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
        </div>
      </div>
    </div>
  );
};

const FormField = ({ label, input, error }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    {input}
    <div className="mt-1 min-h-[16px] text-xs text-red-600">{error || ""}</div>
  </div>
);

export default PurchaseReturnFormModal;