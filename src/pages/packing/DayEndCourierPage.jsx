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

  

  const saveBoxCount = async (feedback_id, no_of_box) => {
    try {
      await axios.post(`${API}/api/feedback/box`, {
        feedback_id,
        no_of_box: no_of_box === "" || no_of_box == null ? null : Number(no_of_box),
      });
    } catch (e) {
      console.error("Failed to save box count", e);
      alert("Failed to save No. of Box");
    }
  };


  const grouped = useMemo(() => {
    const out = { ST: {}, PROFESSIONAL: {} };
  
    (Array.isArray(rows) ? rows : []).forEach((r) => {
      const courier = String(r.courier_name || "").toUpperCase();
      const date = r.pack_completed_at
        ? r.pack_completed_at.slice(0, 10)
        : "Unknown";
  
      if (!out[courier]) return;
  
      if (!out[courier][date]) out[courier][date] = [];
      out[courier][date].push(r);
    });
  
    return out;
  }, [rows]);

  const renderCourier = (label, groups) => (
    <div className="rounded-lg border bg-white p-2">
      {Object.keys(groups).length === 0 ? (
        <div className="text-xs text-gray-500">No rows</div>
      ) : (
        Object.entries(groups).map(([date, list]) => (
          <div key={date} className="mt-3">
            {/* ✅ Courier + Date header */}
            <div className="mb-1 flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">
                {label}
                <span className="ml-2 text-[11px] font-normal text-gray-500">
                  ({date})
                </span>
              </div>
            </div>
  
            <div className="overflow-hidden rounded-md border">
              <table className="w-full table-fixed text-[11px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-4 px-[2px] py-1 text-center font-medium">#</th>
                  <th className="w-40 px-1 py-1 text-left font-medium">Customer</th>
                  <th className="hidden sm:table-cell px-1 py-1 text-left font-medium">Rep</th>
                  <th className="px-1 py-1 text-left font-medium">City</th>
                  <th className="px-1 py-1 text-left font-medium">Box</th>
                </tr>
              </thead>
                <tbody>
                  {list.map((r, idx) => (
                    <tr key={r.feedback_id} className="border-t">
                      {/* S.No */}
                      <td className="px-1 py-1 w-6 text-gray-600">
                        {idx + 1}
                      </td>
  
                      {/* Customer */}
                      <td className="px-1 py-1 w-[40%] sm:w-[28%] font-semibold break-words">
                        {toTitleCase(r.customer_name)}
                      </td>
  
                      {/* Rep – desktop only */}
                      <td className="hidden sm:table-cell px-1 py-1 w-[16%] break-words">
                        {toTitleCase(r.rep_name)}
                      </td>
  
                      {/* City */}
                      <td className="px-1 py-1 w-[18%] sm:w-[14%] break-words">
                        {toTitleCase(r.city)}
                      </td>
  
                      {/* Box */}
                      <td className="px-1 py-1 w-[20%] sm:w-[14%]">
                        <div className="inline-flex items-center gap-1 pr-2">
                          <input
                            className="h-6 w-[30px] rounded-l-md border border-r-0 px-1 text-[11px] outline-none"
                            value={r.no_of_box ?? ""}
                            onChange={(e) =>
                              setRows((prev) =>
                                (Array.isArray(prev) ? prev : []).map((x) =>
                                  x.feedback_id === r.feedback_id
                                    ? { ...x, no_of_box: e.target.value }
                                    : x
                                )
                              )
                            }
                            inputMode="numeric"
                          />
  
                          <button
                            type="button"
                            className="h-6 w-8 rounded-r-md border text-green-700 hover:bg-green-50 flex items-center justify-center"
                            title="Save"
                            onClick={() =>
                              saveBoxCount(r.feedback_id, r.no_of_box)
                            }
                          >
                            ✓
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
      {renderCourier("ST", grouped.ST)}
      {renderCourier("Professional", grouped.PROFESSIONAL)}
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
      console.log(res.data)
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
