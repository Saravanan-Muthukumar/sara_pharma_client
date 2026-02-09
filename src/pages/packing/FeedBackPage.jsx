import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API, toTitleCase } from "../../components/packing/packingUtils";
import { AuthContext } from "../../context/authContext";

const Badge = ({ status }) => {
  const isPending = status === "PENDING";
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-[2px] text-[11px] font-semibold " +
        (isPending ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800")
      }
    >
      {status}
    </span>
  );
};


export default function FeedbackPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Filters (both staff + admin use same UI)
  const [customer, setCustomer] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [courierDate, setCourierDate] = useState("");

  // Admin-only filter (safe to show; billing backend ignores extra privilege anyway)
  const [status, setStatus] = useState("pending"); // pending | resolved | all
  const { currentUser } = useContext(AuthContext);
  // pick the correct field you store (name/username)
  const username = String(currentUser?.name || currentUser?.username || "").trim();
  const isAdmin = username.toLowerCase() === "admin";

  // Load list
  const fetchList = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await axios.get(`${API}/api/feedback/open`, {
        params: {
          username, // ✅ add this
          customer: customer || undefined,
          invoice_date: invoiceDate || undefined,
          courier_date: courierDate || undefined,
          status: status || undefined,
        },
      });
      console.log("feedback rows:", Array.isArray(res.data) ? res.data.length : res.data);
      const data = Array.isArray(res.data) ? res.data : [];

      const norm = (s) => String(s || "").trim().toLowerCase();

      const filtered = isAdmin
        ? data
        : data.filter((r) => norm(r.rep_name) === norm(username));

      setRows(filtered);

      // debug
      console.log("currentUser:", currentUser);
      console.log("username:", username, "isAdmin:", isAdmin);
      console.log("api rows:", data.length, "filtered rows:", filtered.length);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load feedback list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!username) return;   // wait until user loaded
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, status]); // status optional

  // Update single row in local state
  const patchRow = (feedback_id, patch) => {
    setRows((prev) =>
      (Array.isArray(prev) ? prev : []).map((r) =>
        r.feedback_id === feedback_id ? { ...r, ...patch } : r
      )
    );
  };

  // Confirmation logic (your POST /api/feedback/update already closes when sr=1 & ok=1)
  const confirmRow = async (r) => {
    // ✅ Confirmation rules
    // 1) no_of_box must be present (if you want enforce)
    if (r.no_of_box == null || r.no_of_box === "" || Number(r.no_of_box) <= 0) {
      alert("Please enter No of Box before confirming");
      return;
    }

    // 2) Box received must be selected
    if (r.stock_received !== 0 && r.stock_received !== 1) {
      alert("Please select Box Received (Yes/No)");
      return;
    }

    // 3) If received=Yes, Box OK must be selected
    if (r.stock_received === 1 && r.stocks_ok !== 0 && r.stocks_ok !== 1) {
      alert("Please select Box OK (Yes/No)");
      return;
    }

    // 4) If received=No, follow_up required
    if (r.stock_received === 0) {
      const fu = (r.follow_up || "").trim();
      if (!fu) {
        alert("Follow up is required when Box Received = No");
        return;
      }
    }

    const ok = window.confirm(`Save feedback for ${r.customer_name}?`);
    if (!ok) return;

    try {
      await axios.post(`${API}/api/feedback/update`, {
        username, // ✅ add this
        feedback_id: r.feedback_id,
        stock_received: r.stock_received,
        stocks_ok: r.stocks_ok,
        follow_up: r.follow_up,
      });

      // If user selected Received=Yes and OK=Yes, backend will set issue_resolved_time.
      // For better UX, we can remove it from list when viewing pending.
      if (status === "pending" && r.stock_received === 1 && r.stocks_ok === 1) {
        setRows((prev) => prev.filter((x) => x.feedback_id !== r.feedback_id));
      } else {
        // otherwise keep row
      }

      alert("Saved");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to save");
    }
  };

  const counts = useMemo(() => {
    let pending = 0;
    let resolved = 0;
    rows.forEach((r) => {
      if (r.issue_resolved_time) resolved += 1;
      else pending += 1;
    });
    return { pending, resolved, total: rows.length };
  }, [rows]);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Feedback</h1>
          <div className="text-xs text-gray-500">
            Total: <b>{counts.total}</b> | Pending: <b>{counts.pending}</b> | Resolved:{" "}
            <b>{counts.resolved}</b>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchList}
          disabled={loading}
          className="h-8 rounded-md bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="mt-3 rounded-lg border bg-white p-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
          <input
            className="h-8 rounded-md border px-2 text-xs"
            placeholder="Customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />

          <input
            className="h-8 rounded-md border px-2 text-xs"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />

          <input
            className="h-8 rounded-md border px-2 text-xs"
            type="date"
            value={courierDate}
            onChange={(e) => setCourierDate(e.target.value)}
          />

          <select
            className="h-8 rounded-md border px-2 text-xs"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="all">All</option>
          </select>

          <button
            type="button"
            onClick={fetchList}
            className="h-8 rounded-md border px-3 text-xs font-semibold hover:bg-gray-50"
          >
            Apply
          </button>
        </div>

        {err && <div className="mt-2 text-xs text-red-600">{err}</div>}
      </div>

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-[11px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                  <th className="w-[4%] px-2 py-2 text-left">S.No</th>
                  <th className="w-[18%] px-2 py-2 text-left">Customer</th>
                  <th className="w-[9%] px-2 py-2 text-left">Invoice Date</th>
                  <th className="w-[9%] px-2 py-2 text-left">Courier Date</th>
                  <th className="w-[5%] px-2 py-2 text-center">Inv</th>
                  <th className="w-[5%] px-2 py-2 text-center">Box</th>
                  <th className="w-[10%] px-2 py-2 text-left">Rep</th>
                  <th className="w-[10%] px-2 py-2 text-center">Box Received</th>
                  <th className="w-[8%] px-2 py-2 text-center">Box OK</th>
                  <th className="w-[14%] px-2 py-2 text-left">Follow Up</th>
                  <th className="w-[8%] px-2 py-2 text-center">Status</th>
                  <th className="w-[8%] px-2 py-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => {
                const statusText = r.issue_resolved_time ? "RESOLVED" : "PENDING";
                const disableOk = r.stock_received === 0; // rule: if received=No, OK must be null

                return (
                  <tr key={r.feedback_id} className="border-t align-top">
                    <td className="px-2 py-2">{idx + 1}</td>
                    <td className="px-2 py-2 truncate">
                      {toTitleCase(r.customer_name)}
                    </td>
                    <td className="px-2 py-2">{r.invoice_date ? String(r.invoice_date).slice(0, 10) : "-"}</td>
                    <td className="px-2 py-2">{r.courier_date ? String(r.courier_date).slice(0, 10) : "-"}</td>
                    <td className="px-2 py-2 text-center">{Number(r.invoice_count) || 0}</td>
                    <td className="px-2 py-2 text-center">{r.no_of_box ?? "-"}</td>
                    <td className="px-2 py-2">{toTitleCase(r.rep_name)}</td>

                    {/* Box Received */}
                    <td className="px-2 py-2 text-center">
                      <select
                        className="h-7 rounded-md border px-2 text-[11px]"
                        value={r.stock_received ?? ""}
                        disabled={!!r.issue_resolved_time}
                        onChange={(e) => {
                          const v = e.target.value === "" ? null : Number(e.target.value);
                          // If received=No, OK must be cleared
                          patchRow(r.feedback_id, { stock_received: v, ...(v === 0 ? { stocks_ok: null } : {}) });
                        }}
                      >
                        <option value="">-</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </td>

                    {/* Box OK */}
                    <td className="px-2 py-2 text-center">
                      <select
                        className="h-7 rounded-md border px-2 text-[11px]"
                        value={r.stocks_ok ?? ""}
                        disabled={!!r.issue_resolved_time || disableOk}
                        onChange={(e) => {
                          const v = e.target.value === "" ? null : Number(e.target.value);
                          patchRow(r.feedback_id, { stocks_ok: v });
                        }}
                      >
                        <option value="">-</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </td>

                    {/* Follow up */}
                    <td className="px-2 py-2">
                      <input
                        className="h-7 w-full rounded-md border px-2 text-[11px] truncate"
                        value={r.follow_up ?? ""}
                        disabled={!!r.issue_resolved_time}
                        onChange={(e) => patchRow(r.feedback_id, { follow_up: e.target.value })}
                        placeholder={r.stock_received === 0 ? "Required if not received" : ""}
                      />
                    </td>

                    <td className="px-2 py-2 text-center">
                      <Badge status={statusText} />
                    </td>

                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        className="h-7 rounded-md bg-green-600 px-3 text-[11px] font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                        disabled={!!r.issue_resolved_time}
                        onClick={() => confirmRow(r)}
                        title="Save (Resolves automatically if Received=Yes and OK=Yes)"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-2 py-8 text-center text-xs text-gray-500">
                    No records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && <div className="p-3 text-xs text-gray-500">Loading...</div>}
      </div>
    </div>
  );
}
