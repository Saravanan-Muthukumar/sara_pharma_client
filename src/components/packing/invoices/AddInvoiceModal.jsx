// src/components/packing/invoices/AddInvoiceModal.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API } from "../packingUtils";
import AddEditInvoiceForm from "./AddEditInvoiceForm";
import { useInvoiceSameCustomerCheck } from "../../../hooks/packing/useInvoiceSameCustomerCheck";
import { isValidInvoiceNumberSA0 } from "../../packing/packingUtils";


const AddInvoiceModal = ({
  open,
  onClose,
  currentUsername,
  rowsToday = [],
  onSaved,
}) => {
  const [saving, setSaving] = useState(false);

  const [values, setValues] = useState({
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().slice(0, 10), // ✅ keep even if field hidden
    noOfProducts: "",
    customerName: "",
    courierName: "",
    invoiceValue: "",
    salesRep: "",
  });

  useEffect(() => {
    if (!open) return;
    setSaving(false);
    setValues({
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().slice(0, 10),
      noOfProducts: "",
      customerName: "",
      courierName: "",
      invoiceValue: "",
      salesRep: "",
    });
  }, [open]);

  const { checking, sameCustomerInvoices } = useInvoiceSameCustomerCheck({
    open,
    rows: rowsToday,
    customerName: values.customerName,
  });

  const tip = useMemo(() => {
    if (checking) return "Checking other invoices for this customer…";
    if (sameCustomerInvoices.length > 1)
      return `Other invoices for this customer today: ${sameCustomerInvoices.join(", ")}`;
    return "Tip: customer duplicates will show here automatically.";
  }, [checking, sameCustomerInvoices]);

  const save = async () => {
    // ✅ VALIDATE USING CAMELCASE KEYS (same as form)
    
    const invoice_date = String(values.invoiceDate || "").trim(); // if you hide date field, it still defaults
    const customer_name = String(values.customerName || "").trim();
    const courier_name = String(values.courierName || "").trim();
    const invoice_number = String(values.invoiceNumber || "").trim().toUpperCase();
                        if (!isValidInvoiceNumberSA0(invoice_number)) {
                        alert("Invoice number must be like SA000123 (SA0 + 5 digits)");
                         return;
                        }

    const noOfProductsNum = Number(values.noOfProducts);

    // Required fields (match your UI)
    if (!invoice_number || !invoice_date || !customer_name || !courier_name || !noOfProductsNum) {
      alert("Please fill all required fields (*)");
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API}/api/packing/create`, {
        invoice_number,
        invoice_date, // ✅ YYYY-MM-DD
        no_of_products: noOfProductsNum,
        invoice_value:
          values.invoiceValue === "" ? null : Number(values.invoiceValue),
        customer_name,
        rep_name: String(values.salesRep || "").trim() || null,
        courier_name,
        created_by: currentUsername,
        // ✅ taken_by intentionally omitted => NULL
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
          <AddEditInvoiceForm
            open
            editingInvoice={null}
            isAdmin={false}
            values={values}
            setValues={setValues}
            onSave={save}
            onCancel={onClose}
            saving={saving}
          />

          <div className="mt-3 rounded-md border bg-gray-50 px-3 py-2 text-xs text-gray-700">
            {tip}
          </div>

          <div className="mt-2 text-[11px] text-gray-500">
            New invoice will start in <b>TO_TAKE</b>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInvoiceModal;
