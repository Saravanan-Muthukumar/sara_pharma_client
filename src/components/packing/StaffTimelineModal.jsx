// src/components/packing/StaffTimelineModal.jsx
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API } from "./packingUtils";

const StaffTimelineModal = ({ open, onClose, username }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timeOnly = (v) => {
    if (!v) return "-";
    return new Date(v).toISOString().slice(11, 16);
  };
  const sortedRows = useMemo(() => {
    return [...rows].sort(
      (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );
  }, [rows]);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `${API}/api/reports/staff-timeline`,
          { params: { username } }
        );
        setRows(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError("Failed to load timeline");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, username]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Staff Timeline</div>
            <div className="text-xs text-gray-500">{username}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm hover:text-red-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto ">
          {loading && <div className="text-xs text-gray-500">Loading…</div>}
          {error && <div className="text-xs text-red-600">{error}</div>}

          {!loading && !error && rows.length === 0 && (
            <div className="text-xs text-gray-500 text-center">
              No activity found
            </div>
          )}

          {!loading && rows.length > 0 && (
            <table className="w-full text-xs border-l-0">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border-r border-b px-2 py-1">Start</th>
                  <th className="border-r border-b px-2 py-1">End</th>
                  {/* <th className="border-r border-b px-2 py-1">Duration</th> */}
                  <th className="border-r border-b px-2 py-1">Action</th>
                  <th className="border-r border-b px-2 py-1">Customer</th>
                  <th className="border-r border-b px-2 py-1">Invoice</th>
                  <th className="bborder-r border-b px-2 py-1">Qty</th>
                  <th className="border-r border-b px-2 py-1">Value</th>
                  {/* <th className="border-r border-b px-2 py-1">Status</th> */}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((r, i) => (
                  <tr key={i}>
                    <td className="border-r border-b px-2 py-1">
                      {timeOnly(r.start_time) || "-"}
                    </td>
                    <td className="border-r border-b px-2 py-1">
                      {timeOnly(r.end_time) || "-"}
                    </td>
                    {/* <td className="border px-2 py-1">
                      {r.duration_minutes} mins
                    </td> */}
                    <td className="border px-2 py-1">{r.action}</td>
                    <td className="border-r border-b px-2 py-1">
                      {r.customer_name}
                    </td>
                    <td className="border-r border-b px-2 py-1">
                      {r.invoice_number}
                    </td>
                    <td className="border-r border-b px-2 py-1">
                      {r.no_of_products}
                    </td>
                    <td className="border-r border-b px-2 py-1">
                      {r.invoice_value ? r.invoice_value.toString().split(".")[0] : "-"}
                    </td>
                    {/* <td className="border-r border-b px-2 py-1">
                      {r.status === "IN_PROGRESS"
                        ? "In Progress"
                        : "Completed"}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-md border px-3 text-xs hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffTimelineModal;
