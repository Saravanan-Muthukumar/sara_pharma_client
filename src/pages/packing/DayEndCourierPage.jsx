import { useMemo, useState } from "react";
import axios from "axios";
import { API, toTitleCase } from "../../components/packing/packingUtils";

const CourierTable = ({ rows, setRows }) => {
  const groups = useMemo(() => {
    const out = { ST: [], PROFESSIONAL: [] };
    (Array.isArray(rows) ? rows : []).forEach((r) => {
      const key = String(r.courier_name || "").toUpperCase();
      if (key === "ST") out.ST.push(r);
      if (key === "PROFESSIONAL") out.PROFESSIONAL.push(r);
    });
    return out;
  }, [rows]);

  const totalBox = (list) =>
    (list || []).reduce((sum, r) => sum + (Number(r.no_of_box) || 0), 0);

  const updateBox = (feedback_id, value) => {
    const n = value === "" ? null : Number(value);
    setRows((prev) =>
      (Array.isArray(prev) ? prev : []).map((r) =>
        r.feedback_id === feedback_id ? { ...r, no_of_box: Number.isFinite(n) ? n : null } : r
      )
    );
  };

  const renderCourier = (label, list) => (
    <div className="rounded-lg border bg-white p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">{label}</div>
        <div className="text-xs text-gray-600">
          Total box: <b>{totalBox(list)}</b>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-md border">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">S.No</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">City</th>
              <th className="px-3 py-2 text-left">Rep</th>
              <th className="px-3 py-2 text-left">Invoices</th>
              <th className="px-3 py-2 text-left">No. of Box</th>
            </tr>
          </thead>

          <tbody>
            {list.length === 0 ? (
              <tr className="border-t">
                <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                  No rows
                </td>
              </tr>
            ) : (
              list.map((r, idx) => (
                <tr key={r.feedback_id} className="border-t">
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2 font-semibold">{toTitleCase(r.customer_name)}</td>
                  <td className="px-3 py-2">{toTitleCase(r.city)}</td>
                  <td className="px-3 py-2">{toTitleCase(r.rep_name)}</td>
                  <td className="px-3 py-2">{r.invoice_count || 0}</td>
                  <td className="px-3 py-2">
                    <input
                      className="h-8 w-20 rounded-md border px-2 text-xs"
                      value={r.no_of_box ?? ""}
                      onChange={(e) => updateBox(r.feedback_id, e.target.value)}
                      placeholder="-"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
      {renderCourier("ST", groups.ST)}
      {renderCourier("Professional", groups.PROFESSIONAL)}
    </div>
  );
};

const DayEndCourierPage = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const createCourierList = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.post(`${API}/api/feedbacklist`, {});
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("feedbacklist error:", e?.response?.data || e);  
      setErr(e?.response?.data?.message || "Failed to create courier list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Day End — Courier List</h1>
          <div className="text-xs text-gray-500">
            Based on <b>pack_completed_at = today</b> (Local ignored)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="h-8 rounded-md border px-3 text-xs hover:bg-gray-50"
          >
            Back
          </button>

          <button
            type="button"
            onClick={createCourierList}
            disabled={loading}
            className="h-8 rounded-md bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Generating..." : "Create Courier List"}
          </button>
        </div>
      </div>

      {err && <div className="mt-3 text-xs text-red-600">{err}</div>}

      {rows.length > 0 && <CourierTable rows={rows} setRows={setRows} />}
    </div>
  );
};

export default DayEndCourierPage;
