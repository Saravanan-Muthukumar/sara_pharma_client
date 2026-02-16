import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API } from "./packingUtils";

const MarkPackedBoxModal = ({ open, onClose, invoice_id, username, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [invoice_number, setInvoice_number] = useState("");
  const [invoice_count, setInvoice_count] = useState(0);
  const [invoice_numbers, setInvoice_numbers] = useState([]);

  const [customer_name, setCustomer_name] = useState("");
  const [courier_name, setCourier_name] = useState(""); // ✅ NEW

  const [no_of_box, setNo_of_box] = useState(0);
  const [weight, setWeight] = useState("");

  const [confirm_step, setConfirm_step] = useState(false);

  useEffect(() => {
    if (!open || !invoice_id) return;

    const fetch_pack_info = async () => {
      setLoading(true);
      setSaving(false);
      setConfirm_step(false);

      try {
        const res = await axios.get(`${API}/api/packing/pack-info`, {
          params: { invoice_id },
        });

        setInvoice_number(res.data?.invoice_number || "");
        setInvoice_count(Number(res.data?.invoice_count || 0));
        setInvoice_numbers(Array.isArray(res.data?.invoice_numbers) ? res.data.invoice_numbers : []);

        setCustomer_name(res.data?.customer_name || "");
        setCourier_name(res.data?.courier_name || ""); // ✅ NEW

        const existing_boxes = res.data?.existing_no_of_box;
        setNo_of_box(Number.isFinite(Number(existing_boxes)) ? Number(existing_boxes) : 0);

        const existing_weight = res.data?.existing_weight;
        setWeight(existing_weight == null ? "" : String(existing_weight));
      } catch (e) {
        console.error(e);
        alert(e?.response?.data?.message || "Failed to load pack info");
        onClose?.();
      } finally {
        setLoading(false);
      }
    };

    fetch_pack_info();
  }, [open, invoice_id, onClose]);

  const isLocalCourier = useMemo(
    () => String(courier_name || "").trim().toLowerCase() === "local",
    [courier_name]
  );

  const boxLabel = isLocalCourier ? "No. of cover" : "No. of box / cover";

  const dec_box = () => setNo_of_box((v) => Math.max(0, Number(v || 0) - 1));
  const inc_box = () => setNo_of_box((v) => Number(v || 0) + 1);

  const go_confirm = () => setConfirm_step(true);
  const go_back = () => setConfirm_step(false);

  const confirm_update = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/api/packing/mark-packed-with-feedback`, {
        invoice_id,
        username,
        no_of_box,
        weight: weight === "" ? null : Number(weight),
      });

      onSaved?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    // ✅ Centered overlay always
    <div className="fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center bg-black/40 px-3 py-4 overflow-hidden">
      {/* ✅ Smaller modal */}
      <div className="w-full max-w-[360px] rounded-lg bg-white shadow-lg">
        {/* Header (tighter) */}
        <div className="flex items-start justify-between border-b px-3 py-2">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">Mark Packed</div>
            <div className="text-xs text-gray-500 truncate">Invoice: {invoice_number || "-"}</div>
            <div className="text-xs text-gray-500 truncate">Customer: {customer_name || "-"}</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="ml-2 h-8 w-8 rounded-md text-lg text-gray-500 hover:bg-gray-100 disabled:opacity-60"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body (tighter spacing) */}
        <div className="space-y-2 px-3 py-3">
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : confirm_step ? (
            <>
              <div className="rounded-md border bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Confirm before updating</div>

                <div className="mt-2 text-sm">
                  {boxLabel}: <span className="font-semibold">{no_of_box}</span>
                </div>

                {weight !== "" && (
                  <div className="mt-1 text-sm">
                    Weight: <span className="font-semibold">{weight}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={go_back}
                  disabled={saving}
                  className="h-9 flex-1 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={confirm_update}
                  disabled={saving}
                  className="h-9 flex-1 rounded-md bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  {saving ? "Updating..." : "Yes, Update"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-md border bg-gray-50 p-3">
                <div className="text-xs text-gray-500">No. of invoices (read only)</div>
                <div className="text-sm font-semibold">{invoice_count}</div>

                {invoice_count > 1 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="font-semibold text-gray-700">Invoices:</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {invoice_numbers.map((n) => (
                        <span key={n} className="rounded border bg-white px-2 py-1">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* No of Box / Cover (+ / -) */}
              <div>
                <div className="mb-1 text-xs text-gray-500">{boxLabel}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={dec_box}
                    className="h-9 w-9 rounded-md border text-lg hover:bg-gray-50"
                  >
                    −
                  </button>

                  <input
                    value={no_of_box}
                    readOnly
                    className="h-9 w-full rounded-md border bg-gray-50 px-3 text-sm"
                  />

                  <button
                    type="button"
                    onClick={inc_box}
                    className="h-9 w-9 rounded-md border text-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <input
                placeholder="Weight (optional)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="h-9 w-full rounded-md border px-3 text-sm outline-none"
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={go_confirm}
                  disabled={saving}
                  className="h-9 flex-1 rounded-md bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  Confirm
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="h-9 flex-1 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkPackedBoxModal;
