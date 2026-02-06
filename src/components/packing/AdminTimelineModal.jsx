import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API } from "./packingUtils";

const todayYMD = () => new Date().toISOString().slice(0, 10);

const timeOnly = (v) => {
  if (!v) return "-";
  // HH:MM (no seconds)
  return new Date(v).toISOString().slice(11, 16);
};

const AdminTimelineModal = ({ open, onClose }) => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");

  const [from, setFrom] = useState(todayYMD());
  const [to, setTo] = useState(todayYMD());

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");

  // Load users when modal opens (simple)
  useEffect(() => {
    if (!open) return;

    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await axios.get(`${API}/api/getusers`);
        const list = Array.isArray(res.data) ? res.data : [];
        setUsers(list);

        // default select first user if empty
        if (!username && list.length > 0) {
          setUsername(String(list[0]?.username || "").trim());
        }
      } catch (e) {
        // don’t block modal; just show error
        console.error("Users load failed:", e?.response?.data || e);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
    setRows([]);
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const sortedRows = useMemo(() => {
    return [...(rows || [])].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }, [rows]);

  const onSearch = async () => {
    if (!username) {
      setError("Please select staff");
      return;
    }
    if (!from || !to) {
      setError("Please select From and To date");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/reports/staff-timeline`, {
        params: { username, from, to },
      });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Timeline API error:", e?.response?.data || e);
      setError(e?.response?.data?.message || "Failed to load timeline");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Staff Timeline</div>
            <div className="text-xs text-gray-500">Select staff and date range</div>
          </div>
          <button type="button" onClick={onClose} className="text-sm hover:text-red-600">
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="border-b px-4 py-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
            <div>
              <div className="mb-1 text-[11px] text-gray-600">Staff</div>
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-9 w-full rounded-md border px-2 text-xs"
                disabled={loadingUsers}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1 text-[11px] text-gray-600">From</div>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 w-full rounded-md border px-2 text-xs"
              />
            </div>

            <div>
              <div className="mb-1 text-[11px] text-gray-600">To</div>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 w-full rounded-md border px-2 text-xs"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={onSearch}
                disabled={loading || loadingUsers}
                className="h-9 flex-1 rounded-md bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? "Loading…" : "Search"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFrom(todayYMD());
                  setTo(todayYMD());
                  setRows([]);
                  setError("");
                }}
                className="h-9 rounded-md border px-3 text-xs hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>

          {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* ✅ mobile horizontal fit */}
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-[11px] sm:text-xs border border-l-0">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border-r border-b px-2 py-1">Start</th>
                  <th className="border-r border-b px-2 py-1">End</th>
                  <th className="border-r border-b px-2 py-1">Action</th>
                  <th className="border-r border-b px-2 py-1">Customer</th>
                  <th className="border-r border-b px-2 py-1">Invoice</th>
                  <th className="border-r border-b px-2 py-1">Qty</th>
                  <th className="border-b px-2 py-1">Value</th>
                </tr>
              </thead>

              <tbody>
                {sortedRows.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border-r border-b px-2 py-1 whitespace-nowrap">{timeOnly(r.start_time)}</td>
                    <td className="border-r border-b px-2 py-1 whitespace-nowrap">{timeOnly(r.end_time)}</td>
                    <td className="border-r border-b px-2 py-1 whitespace-nowrap">{r.action}</td>
                    <td className="border-r border-b px-2 py-1">{r.customer_name}</td>
                    <td className="border-r border-b px-2 py-1 whitespace-nowrap">{r.invoice_number}</td>
                    <td className="border-r border-b px-2 py-1 text-right whitespace-nowrap">{r.no_of_products}</td>
                    <td className="border-b px-2 py-1 text-right whitespace-nowrap">
                      {r.invoice_value != null ? String(r.invoice_value).split(".")[0] : "-"}
                    </td>
                  </tr>
                ))}

                {!loading && sortedRows.length === 0 && (
                  <tr>
                    <td className="px-2 py-4 text-center text-xs text-gray-500" colSpan={7}>
                      Select staff + date and click Search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 flex justify-end">
          <button type="button" onClick={onClose} className="h-8 rounded-md border px-3 text-xs hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTimelineModal;
