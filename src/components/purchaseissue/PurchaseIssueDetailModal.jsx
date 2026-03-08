import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API, toTitleCase } from "../packing/packingUtils";


const PurchaseIssueDetailModal = ({ open, onClose, issue, onUpdated }) => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [saving, setSaving] = useState(false);

  const loadFollowups = useCallback(async () => {
    if (!issue?.issue_id) {
      setFollowups([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/api/purchase-issue-followups/${issue.issue_id}`
      );
      setFollowups(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setFollowups([]);
    } finally {
      setLoading(false);
    }
  }, [issue?.issue_id]);

  useEffect(() => {
    if (!open || !issue?.issue_id) return;

    setStatus(issue.status || "OPEN");
    setNote("");
    loadFollowups();
  }, [open, issue?.issue_id, issue?.status, loadFollowups]);

  if (!open || !issue) return null;

  const onAddFollowup = async () => {
    if (!String(note || "").trim()) {
      alert("Enter follow up note");
      return;
    }

    try {
      setSaving(true);

      await axios.post(`${API}/api/purchase-issue-followups`, {
        issue_id: issue.issue_id,
        note: String(note || "").trim(),
        updated_by: "Admin",
        status,
      });

      if (status !== issue.status) {
        await axios.put(`${API}/api/purchase-issues/${issue.issue_id}`, {
          purchase_number: issue.purchase_number,
          supplier_id: issue.supplier_id,
          invoice_number: issue.invoice_number,
          invoice_date: issue.invoice_date
            ? String(issue.invoice_date).slice(0, 10)
            : null,
          product_name: issue.product_name,
          issue_type: issue.issue_type,
          quantity: issue.quantity,
          status,
          purchase_verified_by: issue.purchase_verified_by,
          verified_by: issue.verified_by,
          informed_to: issue.informed_to,
          informed_at: issue.informed_at,
          notes: issue.notes,
          recorded_by: issue.recorded_by,
        });
      }

      setNote("");
      await loadFollowups();
      onUpdated?.();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to save follow up");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 md:items-center">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="shrink-0 border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Issue Details & Follow-Up
              </div>
              <div className="text-xs text-gray-500">
                View issue and add follow up
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

        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 xl:grid-cols-[1fr_1.4fr]">
          <div className="rounded-md border bg-white p-4">
            <div className="mb-3 text-lg font-semibold text-blue-900">
              Issue Details
            </div>

            <div className="space-y-3 text-sm">
              <DetailRow label="Purchase No" value={issue.purchase_number} />
              <DetailRow
                label="Supplier"
                value={toTitleCase(issue.supplier_name)}
              />
              <DetailRow label="Invoice No" value={issue.invoice_number} />
              <DetailRow
                label="Invoice Date"
                value={
                  issue.invoice_date
                    ? String(issue.invoice_date).slice(0, 10)
                    : ""
                }
              />
              <DetailRow
                label="Product"
                value={toTitleCase(issue.product_name)}
              />
              <DetailRow label="Issue" value={issue.issue_type} />
              <DetailRow label="Qty" value={issue.quantity} />
              <DetailRow label="Status" value={issue.status} />
              <DetailRow
                label="Purchase Verified By"
                value={issue.purchase_verified_by}
              />
              <DetailRow label="Informed To" value={issue.informed_to} />
              <DetailRow label="Informed At" value={issue.informed_at} />
              <DetailRow label="Recorded By" value={issue.recorded_by} />
              <DetailRow label="Recorded At" value={issue.recorded_at} />
              <DetailRow label="Last Updated" value={issue.last_updated} />
              <DetailRow label="Notes" value={issue.notes} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-md border bg-white">
              <div className="border-b bg-blue-600 px-4 py-3 text-lg font-semibold text-white">
                Follow-Up History
              </div>

              {loading ? (
                <div className="p-4 text-sm text-gray-500">Loading...</div>
              ) : followups.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  No follow up history
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[700px]">
                    <div className="grid grid-cols-3 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                      <div>Date</div>
                      <div>Updated By</div>
                      <div>Note</div>
                    </div>

                    {followups.map((f) => (
                      <div
                        key={f.followup_id}
                        className="grid grid-cols-3 border-t px-4 py-3 text-sm"
                      >
                        <div>{f.updated_at}</div>
                        <div>{f.updated_by}</div>
                        <div>{f.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-md border bg-white">
              <div className="border-b bg-blue-600 px-4 py-3 text-lg font-semibold text-white">
                Add Follow-Up
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Note
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onAddFollowup}
                    disabled={saving}
                    className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Add Follow-Up"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-[180px_1fr] gap-3 border-b pb-2">
    <div className="font-medium text-blue-900">{label}:</div>
    <div className="text-gray-800">{value || "-"}</div>
  </div>
);

export default PurchaseIssueDetailModal;