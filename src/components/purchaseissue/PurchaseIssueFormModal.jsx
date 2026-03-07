import { useEffect, useState } from "react";
import axios from "axios";
import { API, toTitleCase } from "../packing/packingUtils";

const emptyForm = {
  purchase_number: "",
  supplier_id: "",
  invoice_number: "",
  invoice_date: "",
  product_name: "",
  issue_type: "SHORTAGE",
  quantity: "",
  status: "OPEN",
  purchase_verified_by: "",
  verified_by: "",
  informed_to: "",
  informed_at: "",
  notes: "",
  recorded_by: "",
};

const issueTypeOptions = [
  "SHORTAGE",
  "EXCESS",
  "DAMAGE",
  "WRONG_BATCH",
  "WRONG_MRP",
  "WRONG_RATE",
  "SHORT_EXPIRY",
  "BOX_MISSING",
];

const statusOptions = [
  "OPEN",
  "SUPPLIER_CONTACTED",
  "PENDING_REPLACEMENT",
  "PENDING BILL CHANGE",
  "PENDING_CREDIT_NOTE",
  "CLOSED",
];

const PurchaseIssueFormModal = ({ open, onClose, onSaved, editing, suppliers }) => {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (editing) {
      setForm({
        purchase_number: String(editing.purchase_number || ""),
        supplier_id: String(editing.supplier_id || ""),
        invoice_number: String(editing.invoice_number || ""),
        invoice_date: editing.invoice_date ? String(editing.invoice_date).slice(0, 10) : "",
        product_name: String(editing.product_name || ""),
        issue_type: String(editing.issue_type || "SHORTAGE"),
        quantity: String(editing.quantity ?? ""),
        status: String(editing.status || "OPEN"),
        purchase_verified_by: String(editing.purchase_verified_by || ""),
        verified_by: String(editing.verified_by || ""),
        informed_to: String(editing.informed_to || ""),
        informed_at: editing.informed_at
          ? new Date(editing.informed_at).toISOString().slice(0, 16)
          : "",
        notes: String(editing.notes || ""),
        recorded_by: String(editing.recorded_by || ""),
      });
    } else {
      setForm({ ...emptyForm, recorded_by: "Admin" });
    }

    setErrors({});
  }, [open, editing]);

  if (!open) return null;

  const validate = () => {
    const next = {};

    if (!String(form.purchase_number || "").trim()) next.purchase_number = "Purchase number required";
    if (!String(form.supplier_id || "").trim()) next.supplier_id = "Select supplier";
    if (!String(form.product_name || "").trim()) next.product_name = "Product name required";

    if (form.quantity !== "" && (!Number.isFinite(Number(form.quantity)) || Number(form.quantity) < 0)) {
      next.quantity = "Enter valid quantity";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;

    const payload = {
      purchase_number: String(form.purchase_number || "").trim(),
      supplier_id: Number(form.supplier_id),
      invoice_number: String(form.invoice_number || "").trim() || null,
      invoice_date: String(form.invoice_date || "").trim() || null,
      product_name: toTitleCase(form.product_name),
      issue_type: String(form.issue_type || "").trim(),
      quantity: form.quantity === "" ? 0 : Number(form.quantity),
      status: String(form.status || "OPEN").trim(),
      purchase_verified_by: String(form.purchase_verified_by || "").trim() || null,
      verified_by: String(form.verified_by || "").trim() || null,
      informed_to: String(form.informed_to || "").trim() || null,
      informed_at: String(form.informed_at || "").trim() || null,
      notes: String(form.notes || "").trim() || null,
      recorded_by: String(form.recorded_by || "").trim() || null,
    };

    try {
      setSaving(true);

      if (editing?.issue_id) {
        await axios.put(`${API}/api/purchase-issues/${editing.issue_id}`, payload);
      } else {
        await axios.post(`${API}/api/purchase-issues`, payload);
      }

      onSaved?.();
      onClose?.();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to save purchase issue");
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
                {editing ? "Edit Purchase Issue" : "Add Purchase Issue"}
              </div>
              <div className="text-xs text-gray-500">Save purchase issue details</div>
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
              label="Purchase Number"
              error={errors.purchase_number}
              input={
                <input
                  value={form.purchase_number}
                  onChange={(e) => setForm((p) => ({ ...p, purchase_number: e.target.value }))}
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
                  onChange={(e) => setForm((p) => ({ ...p, supplier_id: e.target.value }))}
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
              label="Invoice Number"
              input={
                <input
                  value={form.invoice_number}
                  onChange={(e) => setForm((p) => ({ ...p, invoice_number: e.target.value }))}
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Invoice Date"
              input={
                <input
                  type="date"
                  value={form.invoice_date}
                  onChange={(e) => setForm((p) => ({ ...p, invoice_date: e.target.value }))}
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Product Name"
              error={errors.product_name}
              input={
                <input
                  value={form.product_name}
                  onChange={(e) => setForm((p) => ({ ...p, product_name: e.target.value }))}
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Issue Type"
              input={
                <select
                  value={form.issue_type}
                  onChange={(e) => setForm((p) => ({ ...p, issue_type: e.target.value }))}
                  className="h-10 w-full rounded-md border px-3 text-sm"
                >
                  {issueTypeOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              }
            />

            <FormField
              label="Quantity"
              error={errors.quantity}
              input={
                <input
                  value={form.quantity}
                  onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Status"
              input={
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
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

            <FormField
              label="Purchase Verified By"
              input={
                <input
                  value={form.purchase_verified_by}
                  onChange={(e) => setForm((p) => ({ ...p, purchase_verified_by: e.target.value }))}
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />
{/* 
            <FormField
              label="Verified By"
              input={
                <input
                  value={form.verified_by}
                  onChange={(e) => setForm((p) => ({ ...p, verified_by: e.target.value }))}
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            /> */}

            <FormField
              label="Informed To"
              input={
                <input
                  value={form.informed_to}
                  onChange={(e) => setForm((p) => ({ ...p, informed_to: e.target.value }))}
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Informed At"
              input={
                <input
                  type="datetime-local"
                  value={form.informed_at}
                  onChange={(e) => setForm((p) => ({ ...p, informed_at: e.target.value }))}
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <FormField
              label="Recorded By"
              input={
                <input
                  value={form.recorded_by}
                  onChange={(e) => setForm((p) => ({ ...p, recorded_by: e.target.value }))}
                  className="h-10 w-full rounded-md border px-3 text-sm"
                />
              }
            />

            <div className="md:col-span-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
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

export default PurchaseIssueFormModal;