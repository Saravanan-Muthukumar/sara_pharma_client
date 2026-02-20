// src/components/packing/EditInvoiceModal.jsx
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API } from "./packingUtils";

const emptyInv = {
  invoice_id: null,
  invoice_number: "",
  invoice_date: "",
  no_of_products: "",
  invoice_value: "",
  customer_id: "",
  status: "",
  customer_name: "",
  rep_name: "",
  courier_name: "",
};

const EditInvoiceModal = ({ open, onClose, onSaved }) => {
  const [searchNo, setSearchNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [inv, setInv] = useState(emptyInv);
  const customerRef = useRef(null);

  // ✅ typeahead
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  // const [customerPicked, setCustomerPicked] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSearchNo("");
    setLoading(false);
    setUpdating(false);
    setInv(emptyInv);
    setCustomers([]);
    setLoadingCustomers(false);
    setShowCustomerDropdown(false);
    
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (customerRef.current && !customerRef.current.contains(e.target)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const fetchInvoice = async () => {
    const invoice_number = String(searchNo || "").trim();
    if (!invoice_number) return alert("Enter invoice number");

    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/packing/edit/${encodeURIComponent(invoice_number)}`);
      setInv({
        invoice_id: data?.invoice_id ?? null,
        invoice_number: data?.invoice_number ?? "",
        invoice_date: data?.invoice_date ? String(data.invoice_date).slice(0, 10) : "",
        no_of_products: data?.no_of_products ?? "",
        invoice_value: data?.invoice_value ?? "",
        customer_id: data?.customer_id ?? "",
        status: data?.status ?? "",
        customer_name: data?.customer_name ?? "",
        rep_name: data?.rep_name ?? "",
        courier_name: data?.courier_name ?? "",
      });
    } catch (e) {
      alert(e?.response?.data?.message || "Invoice not found");
      setInv(emptyInv);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CUSTOMER TYPEAHEAD (same idea as AddInvoiceModal)
  useEffect(() => {
    if (!open) return;
    if (!inv.invoice_id) return; // only after fetch

    const q = String(inv.customer_name || "").trim();
    if (q.length < 2) {
      setCustomers([]);
      setShowCustomerDropdown(false);
      
      return;
    }

    const run = async () => {
      setLoadingCustomers(true);
      try {
        const res = await axios.get(`${API}/api/customers`, { params: { q } });
        setCustomers(Array.isArray(res.data) ? res.data : []);
      
      } catch (e) {
        setCustomers([]);
        setShowCustomerDropdown(false);
      } finally {
        setLoadingCustomers(false);
      }
    };

    run();
  }, [open, inv.invoice_id, inv.customer_name]);

  const onPickCustomer = (c) => {
    setInv((p) => ({
      ...p,
      customer_id: c.customer_id ?? "",
      customer_name: c.customer_name || "",
      rep_name: c.rep_name || "",
      courier_name: c.courier_name || "",
    }));
    setShowCustomerDropdown(false);
  };

  const onChangeCustomer = (text) => {
    setInv((p) => ({ ...p, customer_name: text, customer_id: "" })); // require pick again

    setShowCustomerDropdown(text.trim().length >= 2);
  };

  const updateInvoice = async () => {
    if (!inv.invoice_id) return alert("Fetch invoice first");

    const payload = {
      invoice_number: String(inv.invoice_number || "").trim().toUpperCase(),
      invoice_date: String(inv.invoice_date || "").trim() || null,
      no_of_products: Number(inv.no_of_products),
      invoice_value: inv.invoice_value === "" ? null : Number(inv.invoice_value),
      customer_id: Number(inv.customer_id),
    };

    if (!payload.invoice_number) return alert("Invoice number required");
    if (!Number.isInteger(payload.no_of_products) || payload.no_of_products <= 0)
      return alert("No. of Products must be > 0");
    if (!Number.isFinite(payload.customer_id) || payload.customer_id <= 0)
      return alert("Please select a customer from the list");
    if (payload.invoice_value !== null && (!Number.isFinite(payload.invoice_value) || payload.invoice_value < 0))
      return alert("Invoice value must be >= 0");

    setUpdating(true);
    try {
      const { data } = await axios.put(`${API}/api/packing/edit/${inv.invoice_id}`, payload);
      alert(data?.message || "Update successful");
      onSaved?.();
      onClose?.();
    } catch (e) {
      alert(e?.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (!open) return null;
  const setF = (k) => (e) => setInv((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 md:items-center">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">Edit Bill</div>
            <div className="text-xs text-gray-500">Admin</div>
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

        <div className="px-4 py-3 space-y-3">
          <div className="rounded-lg border p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Enter Invoice Number</div>
            <div className="flex gap-2">
              <input
                value={searchNo}
                onChange={(e) => setSearchNo(e.target.value)}
                placeholder="SA023274"
                className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
              />
              <button
                type="button"
                onClick={fetchInvoice}
                disabled={loading}
                className="h-10 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? "..." : "Edit"}
              </button>
            </div>
          </div>

          {inv.invoice_id ? (
            <div className="rounded-lg border p-3">
              <div className="mb-2 text-xs text-gray-600">
                <b>ID:</b> {inv.invoice_id} &nbsp;•&nbsp; <b>Status:</b> {inv.status || "-"}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  value={inv.invoice_number}
                  onChange={setF("invoice_number")}
                  placeholder="Invoice Number"
                  className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
                />
                <input
                  value={inv.invoice_date}
                  onChange={setF("invoice_date")}
                  type="date"
                  className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
                />
                <input
                  value={inv.no_of_products}
                  onChange={setF("no_of_products")}
                  placeholder="No. of Products"
                  inputMode="numeric"
                  className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
                />
                <input
                  value={inv.invoice_value}
                  onChange={setF("invoice_value")}
                  placeholder="Invoice Value (optional)"
                  inputMode="decimal"
                  className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
                />

                {/* ✅ Customer typeahead (editable) */}
                <div className="relative" ref={customerRef}>
                  <input
                    value={inv.customer_name}
                    onChange={(e) => onChangeCustomer(e.target.value)}
                    onFocus={() => {
                          if (inv.customer_name.trim().length >= 2)
                            setShowCustomerDropdown(true);
                        }}
                       
                    placeholder="Customer Name (type to search)"
                    className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
                  />

                  {showCustomerDropdown && (
                    <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-md border bg-white shadow-lg">
                      {loadingCustomers && <div className="px-3 py-2 text-xs text-gray-500">Loading…</div>}

                      {!loadingCustomers && customers.length === 0 && (
                        <div className="px-3 py-2 text-xs text-gray-500">No customers found</div>
                      )}

                      {!loadingCustomers &&
                        customers.slice(0, 8).map((c) => (
                          <button
                            key={c.customer_id}
                            type="button"
                            onMouseDown={(e) => {e.preventDefault(); onPickCustomer(c); }}
                           
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

                {/* ✅ view only (updates when customer picked) */}
                <input
                  value={inv.rep_name}
                  readOnly
                  placeholder="Rep (view)"
                  className="h-10 w-full rounded-md border bg-gray-50 px-3 text-sm text-gray-600"
                />
                <input
                  value={inv.courier_name}
                  readOnly
                  placeholder="Courier (view)"
                  className="h-10 w-full rounded-md border bg-gray-50 px-3 text-sm text-gray-600"
                />

                {/* optional: show selected customer_id for admin clarity */}
                <input
                  value={inv.customer_id}
                  readOnly
                  placeholder="Customer ID (auto)"
                  className="h-10 w-full rounded-md border bg-gray-50 px-3 text-sm text-gray-600"
                />
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={updateInvoice}
                  disabled={updating}
                  className="h-10 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {updating ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-md border px-4 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              Fetch an invoice to edit (invoice_number → Edit). Editable: invoice_number, invoice_date, no_of_products,
              invoice_value, customer_id.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditInvoiceModal;
