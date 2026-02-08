import { useMemo, useState } from "react";
import axios from "axios";
import { API, toTitleCase } from "../../components/packing/packingUtils";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CourierTable = ({ rows, setRows }) => {
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

  // ✅ group: courier -> date -> customer (aggregate invoice_count)
  const grouped = useMemo(() => {
    const out = { ST: {}, PROFESSIONAL: {} };

    (Array.isArray(rows) ? rows : []).forEach((r) => {
      const courier = String(r.courier_name || "").toUpperCase();
      if (!out[courier]) return;

      const date = r.pack_completed_at ? String(r.pack_completed_at).slice(0, 10) : "Unknown";

      if (!out[courier][date]) out[courier][date] = {};

      const key = String(r.customer_name || "").trim().toLowerCase(); // customer grouping key
      if (!out[courier][date][key]) {
        out[courier][date][key] = {
          feedback_id: r.feedback_id, // keep one id to save box (latest wins)
          customer_name: r.customer_name,
          city: r.city,
          rep_name: r.rep_name,
          courier_name: r.courier_name,
          pack_completed_at: r.pack_completed_at,
          invoice_count: 0,
          no_of_box: r.no_of_box ?? null,
        };
      }

      out[courier][date][key].invoice_count += Number(r.invoice_count || 0) || 0;

      // keep latest feedback_id & box if present
      out[courier][date][key].feedback_id = r.feedback_id;
      if (r.no_of_box !== undefined && r.no_of_box !== null && r.no_of_box !== "") {
        out[courier][date][key].no_of_box = r.no_of_box;
      }
    });

    // convert customer maps to arrays (stable order by customer name)
    const normalize = (obj) =>
      Object.fromEntries(
        Object.entries(obj).map(([date, custMap]) => [
          date,
          Object.values(custMap).sort((a, b) =>
            String(a.customer_name || "").localeCompare(String(b.customer_name || ""))
          ),
        ])
      );

    return {
      ST: normalize(out.ST),
      PROFESSIONAL: normalize(out.PROFESSIONAL),
    };
  }, [rows]);

  const updateLocalBox = (feedback_id, value) => {
    setRows((prev) =>
      (Array.isArray(prev) ? prev : []).map((x) =>
        x.feedback_id === feedback_id ? { ...x, no_of_box: value } : x
      )
    );
  };

const courierDate = new Date().toISOString().slice(0, 10);
const [msg, setMsg] = useState("");
const [err, setErr] = useState("");
const [confirmLoading, setConfirmLoading] = useState(false);




  const confirmAllCouriers = async () => {
    const ids = (Array.isArray(rows) ? rows : []).map((r) => r.feedback_id).filter(Boolean);
  
    if (ids.length === 0) return;
  
    const ok = window.confirm(
      `Confirm courier for ALL rows?\nCourier Date: ${courierDate}\nTotal Customers: ${ids.length}`
    );
    if (!ok) return;
  
    try {
      setConfirmLoading(true);
      setMsg("");
      setErr("");
  
      const res = await axios.post(`${API}/api/feedback/confirm-courier-bulk`, {
        feedback_ids: ids,
        courier_date: courierDate,
      });
  
      setMsg(`✅ ${res.data?.message || "Courier confirmed"}`);
      // optional: refresh list
      // await createCourierList();
    } catch (e) {
      const data = e?.response?.data;
      if (data?.missing?.length) {
        setErr(
          `${data.message}. Missing boxes for: ` +
            data.missing.map((m) => `${m.customer_name} (${m.courier_name})`).join(", ")
        );
      } else {
        setErr(data?.message || "Failed to confirm courier");
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const courierTotals = useMemo(() => {
    const totals = { ST: 0, PROFESSIONAL: 0 };
  
    (Array.isArray(rows) ? rows : []).forEach((r) => {
      const courier = String(r.courier_name || "").toUpperCase();
      if (courier === "ST" || courier === "PROFESSIONAL") {
        totals[courier] += Number(r.no_of_box) || 0;
      }
    });
  
    return totals;
  }, [rows]);

  const exportCourierPDF = () => {
    try {
      const doc = new jsPDF("p", "pt", "a4");
  
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      const gap = 10;
      const colWidth = (pageWidth - margin * 2 - gap) / 2;
  
      const title = "Day End — Courier Report";
      const sub = `Courier Date: ${courierDate}`;
  
      doc.setFontSize(14);
      doc.text(title, margin, 40);
  
      doc.setFontSize(10);
      doc.text(sub, margin, 58);
  
      let y = 80;
  
      // collect all unique dates from both couriers
      const allDates = Array.from(
        new Set([
          ...Object.keys(grouped.ST || {}),
          ...Object.keys(grouped.PROFESSIONAL || {}),
        ])
      ).sort();
  
      allDates.forEach((dateKey, dateIdx) => {
        if (dateIdx > 0 && y > 700) {
          doc.addPage();
          y = 40;
        }
  
        const stList = grouped.ST?.[dateKey] || [];
        const proList = grouped.PROFESSIONAL?.[dateKey] || [];
  
        // ----- HEADERS -----
        doc.setFontSize(11);
        doc.text(`ST (${dateKey})`, margin, y);
        doc.text(`Professional (${dateKey})`, margin + colWidth + gap, y);
  
        const stTotal = stList.reduce((s, r) => s + (Number(r.no_of_box) || 0), 0);
        const proTotal = proList.reduce((s, r) => s + (Number(r.no_of_box) || 0), 0);
  
        doc.setFontSize(9);
        doc.text(`Total Box: ${stTotal}`, margin, y + 14);
        doc.text(`Total Box: ${proTotal}`, margin + colWidth + gap, y + 14);
  
        y += 26;
  
        // ----- ST TABLE (LEFT) -----
        autoTable(doc, {
          startY: y,
          tableWidth: colWidth,
          margin: { left: margin },
          head: [["#", "Customer", "City", "Inv", "Box"]],
          body: stList.map((r, i) => [
            i + 1,
            toTitleCase(r.customer_name || ""),
            toTitleCase(r.city || ""),
            Number(r.invoice_count) || 0,
            r.no_of_box ?? "",
          ]),
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [240, 240, 240], textColor: 20 },
        });
  
        const stEndY = doc.lastAutoTable?.finalY || y;
  
        // ----- PROFESSIONAL TABLE (RIGHT) -----
        autoTable(doc, {
          startY: y,
          tableWidth: colWidth,
          margin: { left: margin + colWidth + gap },
          head: [["#", "Customer", "City", "Inv", "Box"]],
          body: proList.map((r, i) => [
            i + 1,
            toTitleCase(r.customer_name || ""),
            toTitleCase(r.city || ""),
            Number(r.invoice_count) || 0,
            r.no_of_box ?? "",
          ]),
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [240, 240, 240], textColor: 20 },
        });
  
        const proEndY = doc.lastAutoTable?.finalY || y;
  
        // move Y to the taller table
        y = Math.max(stEndY, proEndY) + 30;
      });
  
      // -------- SAVE / OPEN (mobile-safe) --------
      const filename = `Courier Report ${courierDate}.pdf`;
      const ua = navigator.userAgent || "";
      const isIOS =
        /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  
      const blob = doc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
  
      if (isIOS) {
        const w = window.open(blobUrl, "_blank");
        if (!w) window.location.href = blobUrl;
        setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
        return;
      }
  
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (e) {
      console.error("PDF export failed:", e);
      alert("Failed to export PDF");
    }
  };

  const renderCourier = (label, groupsByDate, date) => (
    <div className="rounded-lg border bg-white p-2">

      {Object.keys(groupsByDate).length === 0 ? (
       <div>
        <div className="text-xs text-gray-500">No rows</div>
        </div>
        
      ) : (
        Object.entries(groupsByDate).map(([date, list]) => (
          <div key={date} className="mt-3">
            {/* Courier + Date */}
            <div className="mb-1 flex items-center justify-between px-6">
              <div className="text-sm font-semibold text-gray-900">
                {label}
                <span className="ml-2 text-[11px] font-normal text-gray-500">
                  ({date})
                </span>
              </div>

              <div className="text-[11px] text-gray-600">
                Total Box: <b>{courierTotals[label.toUpperCase()] || 0}</b>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border">
              <table className="w-full table-fixed text-[11px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="w-4 px-[2px] py-1 text-center font-medium">#</th>
                    <th className="px-1 py-1 text-left font-medium w-[40%] sm:w-[30%]">
                      Customer
                    </th>
                    <th className="px-1 py-1 text-left font-medium w-[22%] sm:w-[16%]">
                      City
                    </th>
                    <th className="hidden sm:table-cell px-1 py-1 text-left font-medium w-[16%]">
                      Rep
                    </th>
                    <th className="px-1 py-1 text-center font-medium w-[10%] sm:w-[10%]">
                      Inv
                    </th>
                    <th className="px-1 py-1 text-left font-medium w-[18%] sm:w-[16%]">
                      Box
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {list.map((r, idx) => (
                    <tr key={`${r.feedback_id}-${idx}`} className="border-t">
                      <td className="px-[2px] py-1 w-4 text-center text-gray-600">
                        {idx + 1}
                      </td>

                      <td className="px-1 py-1 font-semibold break-words w-[40%] sm:w-[30%]">
                        {toTitleCase(r.customer_name)}
                      </td>

                      <td className="px-1 py-1 break-words w-[22%] sm:w-[16%]">
                        {toTitleCase(r.city)}
                      </td>

                      <td className="hidden sm:table-cell px-1 py-1 break-words w-[16%]">
                        {toTitleCase(r.rep_name)}
                      </td>

                      <td className="px-1 py-1 text-center w-[10%] sm:w-[10%]">
                        {r.invoice_count || 0}
                      </td>

                      <td className="px-1 py-1 w-[18%] sm:w-[16%] min-w-0">
                      <div className="inline-flex items-center gap-[2px] max-w-full">
                        <input
                          className="h-7 w-[28px] sm:h-6 sm:w-[30px] rounded-l-md border border-r-0 px-[2px] text-[16px] sm:text-[11px] outline-none"
                          value={r.no_of_box ?? ""}
                          onChange={(e) => updateLocalBox(r.feedback_id, e.target.value)}
                          inputMode="numeric"
                        />
                        <button
                          type="button"
                          className="h-7 w-7 sm:h-6 sm:w-8 rounded-r-md border text-green-700 hover:bg-green-50 flex items-center justify-center"
                          title="Save"
                          onClick={() => saveBoxCount(r.feedback_id, r.no_of_box)}
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
      <div className="mt-4 flex items-center justify-center gap-4">
              <button
                  type="button"
                  onClick={exportCourierPDF}
                  disabled={rows.length === 0}
                  className="h-9 rounded-md border px-4 text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
                >
                  Export PDF
              </button>
                <button
                  type="button"
                  onClick={confirmAllCouriers}
                  disabled={confirmLoading || rows.length === 0}
                  className="h-9 rounded-md bg-green-600 px-4 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {confirmLoading ? "Confirming..." : "Confirm Courier"}
                </button>
              </div>
              {msg && <div className="mt-2 text-xs text-green-700">{msg}</div>}
              {err && <div className="mt-2 text-xs text-red-600">{err}</div>}
    </div>
  );
};

const DayEndCourierPage = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const createCourierList = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.post(`${API}/api/feedbacklist`, {});
      const data = res.data;

      if (Array.isArray(data)) {
        setRows(data);
      } else {
        setRows(Array.isArray(data?.rows) ? data.rows : []);
        console.log("mode:", data?.mode);
      }
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
          onClick={() => navigate(-1)}
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
