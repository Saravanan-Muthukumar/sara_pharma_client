import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API } from "./packingUtils";

const MarkPackedBoxModal = ({ open, onClose, invoice_id, username, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const [info, setInfo] = useState({invoice_number: "", invoice_count: 0, invoice_numbers: [], customer_name: "",
    courier_name: "", no_of_box: 1, weight: "", });

  const isLocal = useMemo(() => String(info.courier_name || "").trim().toLowerCase() === "local", [info.courier_name]);
  const boxLabel = isLocal ? "No. of cover" : "No. of box";

  useEffect(() => {
    if (!open || invoice_id == null) return;

    (async () => {
      setLoading(true);
      setSaving(false);
      setConfirm(false);
      try {
        const { data } = await axios.get(`${API}/api/packing/pack-info`, { params: { invoice_id } });
        const existing = Number(data?.existing_no_of_box);
        setInfo((p) => ({
          ...p,
          invoice_number: data?.invoice_number || "",
          invoice_count: Number(data?.invoice_count || 0),
          invoice_numbers: Array.isArray(data?.invoice_numbers) ? data.invoice_numbers : [],
          customer_name: data?.customer_name || "",
          courier_name: data?.courier_name || "",
          no_of_box: Number.isFinite(existing) && existing > 0 ? existing : 1,
          weight: data?.existing_weight == null ? "" : String(data.existing_weight),
        }));
      } catch (e) {
        alert(e?.response?.data?.message || "Failed to load pack info");
        onClose?.();
      } finally {
        setLoading(false);
      }
    })();
  }, [open, invoice_id, onClose]);

  const setNo = (fn) => setInfo((p) => ({ ...p, no_of_box: fn(p.no_of_box) }));
  const dec = () => setNo((v) => Math.max(1, Number(v || 1) - 1));
  const inc = () => setNo((v) => Number(v || 1) + 1);

  const update = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/api/packing/mark-packed-with-feedback`, {
        invoice_id,
        username,
        no_of_box: Math.max(1, Number(info.no_of_box || 1)),
        weight: info.weight === "" ? null : Number(info.weight),
      });
      onSaved?.();
      onClose?.();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center bg-black/40 px-3 py-4">
      <div className="w-full max-w-[360px] rounded-lg bg-white shadow-lg">
        <div className="flex items-start justify-between border-b px-3 py-2">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">Mark Packed</div>
            <div className="text-xs text-gray-500 truncate">{info.customer_name || "-"}</div>
            <div className="text-xs text-gray-500 truncate">{info.invoice_number || "-"}</div>
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

        <div className="space-y-2 px-3 py-3">
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : confirm ? (
            <>
              <div className="rounded-md border bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Confirm before updating</div>
                <div className="mt-2 text-sm">
                  {boxLabel}: <span className="font-semibold">{info.no_of_box}</span>
                </div>
                {info.weight !== "" && (
                  <div className="mt-1 text-sm">
                    Weight: <span className="font-semibold">{info.weight}</span> Kg
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirm(false)}
                  disabled={saving}
                  className="h-9 flex-1 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={update}
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
                <div className="text-sm font-semibold">{info.invoice_count}</div>

                {info.invoice_count > 1 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="font-semibold text-gray-700">
                      Invoices Today for {info.customer_name}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {info.invoice_numbers.map((n) => (
                        <span key={n} className="rounded border bg-white px-2 py-1">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-gray-500">{boxLabel}</div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={dec} className="h-12 w-12 rounded-md border text-2xl hover:bg-gray-50">
                    −
                  </button>
                  <input readOnly value={info.no_of_box} className="h-12 w-14 rounded-md border bg-gray-50 px-2 text-center text-sm" />
                  <button type="button" onClick={inc} className="h-12 w-12 rounded-md border text-2xl hover:bg-gray-50">
                    +
                  </button>
                </div>
              </div>

              {!isLocal && (
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="Weight in Kg"
                  value={info.weight}
                  onChange={(e) => setInfo((p) => ({ ...p, weight: e.target.value }))}
                  className="h-9 w-full rounded-md border px-3 text-sm outline-none"
                />
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { if (!info.weight || Number(info.weight) <= 0) {
                                alert("Please enter weight in Kg");
                                return;}
                                setConfirm(true)}}
                  disabled={saving}
                  className="h-9 flex-1 rounded-md bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  Confirm
                </button>
                <button type="button" onClick={onClose} disabled={saving}
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
