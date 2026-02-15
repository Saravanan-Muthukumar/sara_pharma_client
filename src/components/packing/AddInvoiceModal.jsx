// src/components/packing/invoices/AddInvoiceModalBasic.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API } from "./packingUtils";
import { AuthContext } from "../../context/authContext";

/**
 * Modal UI/format matches your screenshot:
 * - Header: "Add Bills (Invoice)" + "Billing Staff" + close (✕)
 * - Form card: "Add Invoice" + 2-column inputs
 * - Customer field uses inline typeahead (GET /api/customers?q=)
 * - Auto-fills Sales Rep + Courier from selected customer (still editable like screenshot)
 * - Footer tip + "New invoice will start in TO_TAKE."
 */
const AddInvoiceModal = ({
  open,
  onClose,
  currentUsername,
  rowsToday = [],
  onSaved,
}) => {
  const { currentUser } = useContext(AuthContext); // if you use currentUser in context
  const createdBy = String(currentUsername || currentUser?.username || "").trim();

  // form values (match screenshot fields)
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [noOfProducts, setNoOfProducts] = useState("");
  const [invoiceValue, setInvoiceValue] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [courierName, setCourierName] = useState("");
  const [salesRep, setSalesRep] = useState("");

  // typeahead state
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sameCustomerInvoices, setSameCustomerInvoices] = useState([]);

  // reset when opening
  useEffect(() => {
    if (!open) return;
    setSaving(false);

    setInvoiceNumber("");
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setNoOfProducts("");
    setInvoiceValue("");
    setCustomerName("");
    setCustomerId(null);
    setCourierName("");
    setSalesRep("");

    setCustomers([]);
    setShowCustomerDropdown(false);
    setSameCustomerInvoices([]);
    setChecking(false);
  }, [open]);

  // customer duplicates tip (simple local check against rowsToday)
  useEffect(() => {
    if (!open) return;

    const name = customerName.trim().toLowerCase();
    if (!name) {
      setSameCustomerInvoices([]);
      setChecking(false);
      return;
    }

    setChecking(true);
    const matches = (rowsToday || [])
      .filter((r) => String(r.customer_name || "").trim().toLowerCase() === name)
      .map((r) => String(r.invoice_number || "").trim())
      .filter(Boolean);

    // unique
    const uniq = Array.from(new Set(matches));
    setSameCustomerInvoices(uniq);
    setChecking(false);
  }, [open, customerName, rowsToday]);

  const tipText = useMemo(() => {
    if (checking) return "Checking other invoices for this customer…";
    if (sameCustomerInvoices.length > 1) {
      return `Other invoices for this customer today: ${sameCustomerInvoices.join(", ")}`;
    }
    return "Tip: customer duplicates will show here automatically.";
  }, [checking, sameCustomerInvoices]);

  // CUSTOMER TYPEAHEAD (inline)
  useEffect(() => {
    const q = customerName.trim();
    if (!open) return;

    // Only search when typing (and not after a selection that sets customerId)
    if (q.length < 2) {
      setCustomers([]);
      setShowCustomerDropdown(false);
      return;
    }

    // If a customer is already selected and user isn't editing text, don’t spam search
    // (but if they type again, customerId gets cleared below)
    const run = async () => {
      setLoadingCustomers(true);
      try {
        const res = await axios.get(`${API}/api/customers`, { params: { q } });
        setCustomers(Array.isArray(res.data) ? res.data : []);
        setShowCustomerDropdown(true);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        setCustomers([]);
        setShowCustomerDropdown(false);
      } finally {
        setLoadingCustomers(false);
      }
    };

    run();
  }, [open, customerName]);

  const onPickCustomer = (c) => {
    setCustomerId(c.customer_id);
    setCustomerName(c.customer_name || "");
    // auto-fill (still editable like screenshot)
    setSalesRep(c.rep_name || "");
    setCourierName(c.courier_name || "");
    setShowCustomerDropdown(false);
  };

  const onChangeCustomer = (text) => {
    setCustomerName(text);
    setCustomerId(null); // typing invalidates selection
    setShowCustomerDropdown(text.trim().length >= 2);
  };

  const save = async () => {
    const invoice_number = String(invoiceNumber || "").trim().toUpperCase();
    const invoice_date = String(invoiceDate || "").trim();
    const no_of_products = Number(noOfProducts);
    const invoice_value = invoiceValue === "" ? null : Number(invoiceValue);

    if (!invoice_number || !invoice_date || !Number.isFinite(no_of_products) || no_of_products <= 0) {
      alert("Please fill all required fields (*)");
      return;
    }
    if (!customerId) {
      alert("Please select a customer from the list");
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API}/api/packing/create`, {
        invoice_number,
        invoice_date,
        no_of_products,
        invoice_value,
        customer_id: customerId,
        created_by: createdBy || "unknown",
        // optional fields if your backend still accepts them:
        courier_name: String(courierName || "").trim() || undefined,
        rep_name: String(salesRep || "").trim() || undefined,
      });

      onSaved?.();
      onClose?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert(e?.response?.data?.message || "Failed to add invoice");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 md:items-center">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">Add Bills (Invoice)</div>
              <div className="text-xs text-gray-500">Billing Staff</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-md text-lg text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
    
          {/* Body */}
          <div className="px-4 py-3">
            {/* Form card */}
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-gray-900">Add Invoice</div>
    
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  placeholder="Invoice Number *"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
                />
    
                <input
                  placeholder="No. of Products *"
                  value={noOfProducts}
                  onChange={(e) => setNoOfProducts(e.target.value)}
                  inputMode="numeric"
                  className="h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
                />
    
                {/* Customer typeahead */}
                <div className="relative">
                  <input
                    placeholder="Customer Name *"
                    value={customerName}
                    onChange={(e) => onChangeCustomer(e.target.value)}
                    onFocus={() => {
                      if (customerName.trim().length >= 2) setShowCustomerDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 150)}
                    className="h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
                  />
    
                  {showCustomerDropdown && (
                    <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-md border bg-white shadow-lg">
                      {loadingCustomers && (
                        <div className="px-3 py-2 text-xs text-gray-500">Loading…</div>
                      )}
    
                      {!loadingCustomers && customers.length === 0 && (
                        <div className="px-3 py-2 text-xs text-gray-500">No customers found</div>
                      )}
    
                      {!loadingCustomers &&
                        customers.slice(0, 8).map((c) => (
                          <button
                            key={c.customer_id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => onPickCustomer(c)}
                            className="block w-full px-3 py-2 text-left hover:bg-gray-50"
                          >
                            <div className="text-sm font-medium text-gray-900">{c.customer_name}</div>
                            <div className="text-[11px] text-gray-500">
                              {c.city ? c.city : ""}
                              {c.rep_name ? ` • Rep: ${c.rep_name}` : ""}
                              {c.courier_name ? ` • Courier: ${c.courier_name}` : ""}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
    
                <input
                  placeholder="Courier Name *"
                  value={courierName}
                  // onChange={(e) => setCourierName(e.target.value)}
                  className="h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
                />
    
                <input
                  placeholder="Invoice Value (optional)"
                  value={invoiceValue}
                  onChange={(e) => setInvoiceValue(e.target.value)}
                  inputMode="decimal"
                  className="h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
                />
    
                <input
                  placeholder="Sales Rep (auto)"
                  value={salesRep}
                  // onChange={(e) => setSalesRep(e.target.value)}
                  className="h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
                />
              </div>
    
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="h-11 rounded-md bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
    
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="h-11 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
    
            {/* Tip */}
            <div className="mt-3 rounded-md border bg-gray-50 px-3 py-2 text-xs text-gray-700">
              {tipText}
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
