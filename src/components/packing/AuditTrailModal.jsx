// src/components/packing/AuditTrailModal.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "./packingUtils";

const AuditTrailModal = ({ open, onClose }) => {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!open) return;
    setInvoiceNo("");
    setLoading(false);
    setData(null);
  }, [open]);

  const fetchAudit = async () => {
    const no = String(invoiceNo || "").trim().toUpperCase();
    if (!no) return alert("Enter invoice number");
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/packing/audit/${encodeURIComponent(no)}`);
      setData(res.data || null);
    } catch (e) {
      alert(e?.response?.data?.message || "Not found");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  const inv = data?.invoice || {};
  const fb = data?.feedback || null;

  const yesNo = (v) => (v === 1 || v === "1" ? "YES" : v === 0 || v === "0" ? "NO" : "-");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 md:items-center">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">Invoice Audit</div>
            <div className="text-xs text-gray-500">Admin</div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-md text-lg text-gray-500 hover:bg-gray-100">✕</button>
        </div>

        <div className="px-4 py-3 space-y-3">
          <div className="rounded-lg border p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Enter Invoice Number</div>
            <div className="flex gap-2">
              <input
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="SA023274"
                className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
              />
              <button
                type="button"
                onClick={fetchAudit}
                disabled={loading}
                className="h-10 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? "..." : "OK"}
              </button>
            </div>
          </div>

          {data && (
            <div className="rounded-lg border p-3 text-sm">
              <div className="text-xs text-gray-600 mb-2">
                <b>Invoice:</b> {inv.invoice_number} &nbsp;•&nbsp; <b>Status:</b> {inv.status}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div><b>Customer:</b> {inv.customer_name || "-"}</div>
                <div><b>Customer ID:</b> {inv.customer_id || "-"}</div>
                <div><b>Rep:</b> {inv.rep_name || "-"}</div>
                <div><b>Courier:</b> {inv.courier_name || "-"}</div>

                <div><b>Invoice Date:</b> {inv.invoice_date ? String(inv.invoice_date).slice(0, 10) : "-"}</div>
                <div><b>No of Products:</b> {inv.no_of_products ?? "-"}</div>
                <div><b>Invoice Value:</b> {inv.invoice_value ?? "-"}</div>
              </div>

              <hr className="my-3" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div><b>Take Started:</b> {inv.take_started_at || "-"}</div>
                <div><b>Taken By:</b> {inv.taken_by || "-"}</div>

                <div><b>Take Completed:</b> {inv.take_completed_at || "-"}</div>
                <div><b>Verify Started:</b> {inv.verify_started_at || "-"}</div>

                <div><b>Packed At:</b> {inv.pack_completed_at || "-"}</div>
                <div><b>Packed By:</b> {inv.packed_by || "-"}</div>
              </div>

              <hr className="my-3" />

              <div className="text-xs font-semibold text-gray-700 mb-2">Feedback</div>

              {!fb ? (
                <div className="text-xs text-gray-500">No feedback found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div><b>Courier Date:</b> {fb.courier_date ? String(fb.courier_date).slice(0, 10) : "-"}</div>
                  <div><b>No of Box:</b> {fb.no_of_box ?? "-"}</div>
                  <div><b>Weight:</b> {fb.weight ?? "-"}</div>
                  <div><b>Stock Received:</b> {yesNo(fb.stock_received)}</div>
                  <div><b>Stock OK:</b> {yesNo(fb.stocks_ok)}</div>
                  <div><b>Feedback Time:</b> {fb.feedback_time || "-"}</div>
                  <div className="md:col-span-2"><b>Follow Up:</b> {fb.follow_up || "-"}</div>
                  <div className="md:col-span-2"><b>Issue Resolved:</b> {fb.issue_resolved_time || "-"}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-3 flex justify-end">
          <button onClick={onClose} className="h-10 rounded-md border px-4 text-sm hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailModal;
