import { useEffect, useState } from "react";
import axios from "axios";
import { API, toTitleCase } from "../../components/packing/packingUtils";

const FeedbackPage1 = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // search filters
  const [customer, setCustomer] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [courierDate, setCourierDate] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      setMsg("");

      const res = await axios.get(`${API}/api/feedback/open`, {
        params: {
          customer: customer || undefined,
          invoice_date: invoiceDate || undefined,
          courier_date: courierDate || undefined,
        },
      });

      const data = Array.isArray(res.data) ? res.data : [];

      setRows(
        data.map((r) => ({
          ...r,
          _stock_received:
            r.stock_received === 1 || r.stock_received === true
              ? "1"
              : r.stock_received === 0 || r.stock_received === false
              ? "0"
              : "",
          _stocks_ok:
            r.stocks_ok === 1 || r.stocks_ok === true
              ? "1"
              : r.stocks_ok === 0 || r.stocks_ok === false
              ? "0"
              : "",
          _follow_up: r.follow_up || "",
          _saving: false,
        }))
      );
    } catch (e) {
      console.error("feedback/open error:", e?.response?.data || e);
      setErr(e?.response?.data?.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLocal = (id, patch) => {
    setRows((prev) => prev.map((x) => (x.feedback_id === id ? { ...x, ...patch } : x)));
  };

  const saveRow = async (r) => {
    try {
      updateLocal(r.feedback_id, { _saving: true });
      setErr("");
      setMsg("");

      const payload = {
        feedback_id: r.feedback_id,
        stock_received: r._stock_received === "" ? null : Number(r._stock_received), // 1/0
        stocks_ok: r._stocks_ok === "" ? null : Number(r._stocks_ok), // 1/0
        follow_up: r._follow_up === "" ? null : r._follow_up,
      };

      await axios.post(`${API}/api/feedback/update`, payload);

      setMsg("✅ Saved");
      await load();
    } catch (e) {
      console.error("feedback/update error:", e?.response?.data || e);
      setErr(e?.response?.data?.message || "Save failed");
    } finally {
      updateLocal(r.feedback_id, { _saving: false });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Feedback Follow-up</h1>
          <div className="text-xs text-gray-500">
            Showing items where <b>issue_resolved_time is NULL</b>
          </div>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="h-8 rounded-md bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
        <input
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="Search customer"
          className="h-9 rounded-md border px-2 text-xs"
        />

        <input
          type="date"
          value={invoiceDate}
          onChange={(e) => setInvoiceDate(e.target.value)}
          className="h-9 rounded-md border px-2 text-xs"
        />

        <input
          type="date"
          value={courierDate}
          onChange={(e) => setCourierDate(e.target.value)}
          className="h-9 rounded-md border px-2 text-xs"
        />

        <button
          type="button"
          onClick={load}
          className="h-9 rounded-md border px-3 text-xs hover:bg-gray-50"
        >
          Search
        </button>
      </div>

      {msg && <div className="mt-3 text-xs text-green-700">{msg}</div>}
      {err && <div className="mt-3 text-xs text-red-600">{err}</div>}

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-md border bg-white">
        <table className="w-full table-fixed text-[11px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-1 py-2 text-left font-medium w-[9%]">Courier Dt</th>
              <th className="px-1 py-2 text-left font-medium w-[10%]">Customer</th>
              <th className="px-1 py-2 text-left font-medium w-[9%]">Invoice Dt</th>
              <th className="px-1 py-2 text-center font-medium w-[5%]">Inv</th>
              <th className="px-1 py-2 text-center font-medium w-[5%]">Box</th>
              <th className="px-1 py-2 text-center font-medium w-[8%]">Received</th>
              <th className="px-1 py-2 text-center font-medium w-[7%]">Stock OK</th>
              <th className="px-1 py-2 text-center font-medium w-[47%]">Follow up / Notes</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-2 py-4 text-xs text-gray-500" colSpan={8}>
                  No open feedbacks
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.feedback_id} className="border-t align-top">
                  <td className="px-1 py-2 break-words">
                    {r.courier_date ? String(r.courier_date).slice(0, 10) : "-"}
                  </td>

                  <td className="px-1 py-2 font-semibold break-words">
                    {toTitleCase(r.customer_name)}
                    <div className="text-[10px] text-gray-500">
                      {toTitleCase(r.courier_name)} • {toTitleCase(r.rep_name)}
                    </div>
                  </td>

                  <td className="px-1 py-2 break-words">
                    {r.invoice_date ? String(r.invoice_date).slice(0, 10) : "-"}
                  </td>

                  <td className="px-1 py-2 text-center">{r.invoice_count || 0}</td>
                  <td className="px-1 py-2 text-center">{r.no_of_box ?? "-"}</td>

                  <td className="px-1 py-2 text-center">
                    <select
                      className="h-8 rounded-md border px-1 text-[12px]"
                      value={r._stock_received}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateLocal(r.feedback_id, {
                          _stock_received: v,
                          _stocks_ok: v === "0" ? "" : r._stocks_ok,
                        });
                      }}
                    >
                      <option value="">-</option>
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                  </td>

                  <td className="px-1 py-2 text-center">
                    <select
                      className="h-8 rounded-md border px-1 text-[12px]"
                      value={r._stocks_ok}
                      onChange={(e) => updateLocal(r.feedback_id, { _stocks_ok: e.target.value })}
                      disabled={r._stock_received !== "1"}
                    >
                      <option value="">-</option>
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                  </td>

                  <td className="px-1 py-2 flex align-middle gap-3">
                    <textarea
                      className="h-8 w-full resize-none rounded-md border p-1 text-[12px]"
                      value={r._follow_up}
                      onChange={(e) => updateLocal(r.feedback_id, { _follow_up: e.target.value })}
                      placeholder="Type follow up / issue..."
                    />
                    <div className=" flex justify-end">
                      <button
                        type="button"
                        onClick={() => saveRow(r)}
                        disabled={r._saving}
                        className="h-8 rounded-md bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        {r._saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackPage1;
