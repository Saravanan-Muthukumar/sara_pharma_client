// src/components/packing/invoices/AddEditInvoiceForm.jsx
import CustomerTypeaheadInput from "../customers/CustomerTypeaheadInput";

const AddEditInvoiceForm = ({
  open,
  editingInvoice,
  isAdmin,
  values,
  setValues,
  onSave,
  onCancel,
  saving,
}) => {
  if (!open) return null;

  const update = (k) => (e) => setValues((p) => ({ ...p, [k]: e.target.value }));

  const onSelectCustomer = (c) => {
    setValues((p) => ({
      ...p,
      customerName: c.customer_name || p.customerName,
      salesRep: c.rep_name || p.salesRep,
      courierName: c.courier_name || p.courierName,
    }));
  };

  return (
    <div className="mt-4 space-y-3 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          {editingInvoice ? "Edit Invoice" : "Add Invoice"}
        </h2>
        {editingInvoice && (
          <span className="text-xs text-gray-500">ID: {editingInvoice.invoice_id}</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          placeholder="Invoice Number *"
          value={values.invoiceNumber}
          onChange={update("invoiceNumber")}
          className="h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
        />


        <input
          placeholder="No. of Products *"
          value={values.noOfProducts}
          onChange={update("noOfProducts")}
          type="number"
          min="1"
          className="h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
        />

        {/* ✅ Customer search + suggestion + autofill */}
        <CustomerTypeaheadInput
          open={open}
          value={values.customerName}
          onChange={(v) => setValues((p) => ({ ...p, customerName: v }))}
          onSelect={onSelectCustomer}
          placeholder="Customer Name *"
        />

        <input
          placeholder="Courier Name *"
          value={values.courierName}
          onChange={update("courierName")}
          className="h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
        />

        <input
          placeholder="Invoice Value (optional)"
          value={values.invoiceValue}
          onChange={update("invoiceValue")}
          type="number"
          step="0.01"
          className="h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
        />

        {/* ✅ Auto-filled Sales Rep (still editable) */}
        <input
          placeholder="Sales Rep (auto)"
          value={values.salesRep}
          onChange={update("salesRep")}
          className="h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
        />

        {/* ✅ TAKEN BY */}

      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex-1 rounded-md bg-teal-600 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : editingInvoice ? "Save Changes" : "Save"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 rounded-md border py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddEditInvoiceForm;
