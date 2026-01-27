// src/pages/packing/DayEndPage.jsx
import { useCallback, useMemo, useState } from "react";
import { useInvoicesToday } from "../../hooks/packing/useInvoicesToday";
import AddInvoiceModal from "../../components/packing/invoices/AddInvoiceModal";
import { findMissingInvoices } from "../../components/packing/dayend/dayEndUtils";
import DayEndCourierPage from "./DayEndCourierPage";

const dateOnly = (d) => (d ? String(d).slice(0, 10) : "");

const DayEndPage = () => {
  const { rows, loading, error, refresh } = useInvoicesToday();

  // ✅ only invoices whose invoice_date is today (as you requested)


  // --- Day End range / missing invoices ---
  const [range, setRange] = useState({ startInvoice: "", endInvoice: "" });
  const [missingList, setMissingList] = useState([]);
  const [rangeError, setRangeError] = useState("");
  const [drillOpen, setDrillOpen] = useState(false);
  const [drillTitle, setDrillTitle] = useState("");
  const [drillRows, setDrillRows] = useState([]);
  const [showCourierPage, setShowCourierPage] = useState(false);
  const [addInvoiceOpen, setAddInvoiceOpen] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const list = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);


  const rowsTodayByInvoiceDate = useMemo(() => {
    return (rows || []).filter((r) => String(r.invoice_date || "").slice(0, 10) === todayStr);
  }, [rows, todayStr]);

  const recomputeMissing = useCallback(
    (nextRange) => {
      const { missing, error: errMsg } = findMissingInvoices({
        startInvoice: nextRange.startInvoice,
        endInvoice: nextRange.endInvoice,
        rowsToday: rowsTodayByInvoiceDate,
      });

      setRangeError(errMsg || "");
      setMissingList(missing || []);

    //   if (!errMsg && (missing || []).length > 0) setAddInvoiceOpen(true);
    },
    [rowsTodayByInvoiceDate]
  );

  const onCheckMissing = useCallback(() => {
    recomputeMissing(range);
  }, [range, recomputeMissing]);

  const invoicesTodayList = useMemo(
    () => list.filter((r) => dateOnly(r.invoice_date) === todayStr),
    [list, todayStr]
  );
  
  const previousDaysList = useMemo(() => {
    return list.filter((r) => {
      const invDateNotToday = dateOnly(r.invoice_date) !== todayStr;
      if (!invDateNotToday) return false;
  
      const packedToday = dateOnly(r.pack_completed_at) === todayStr;
      const statusNotPacked = String(r.status || "").toUpperCase() !== "PACKED";
  
      return packedToday || statusNotPacked;
    });
  }, [list, todayStr]);
  
  const packedTodayList = useMemo(
    () => list.filter((r) => dateOnly(r.pack_completed_at) === todayStr),
    [list, todayStr]
  );
  
  const pendingList = useMemo(
    () => list.filter((r) => String(r.status || "").toUpperCase() !== "PACKED"),
    [list]
  );

  // --- Header stats ---
  const stats = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
  
    const invoicesToday = list.filter((r) => dateOnly(r.invoice_date) === todayStr);
  
    const invoicesYesterday = list.filter((r) => {
      const invDateNotToday = dateOnly(r.invoice_date) !== todayStr;
      if (!invDateNotToday) return false;
  
      const packedToday = dateOnly(r.pack_completed_at) === todayStr;
      const statusNotPacked = String(r.status || "").toUpperCase() !== "PACKED";
  
      return packedToday || statusNotPacked;
    });
  
    const packed = list.filter((r) => dateOnly(r.pack_completed_at) === todayStr).length;
  
    const pending = list.filter(
      (r) => String(r.status || "").toUpperCase() !== "PACKED"
    ).length;

    return {
      invoicesToday: invoicesToday.length,
      invoicesYesterday: invoicesYesterday.length,
      totalInvoices: invoicesToday.length + invoicesYesterday.length,
      packed,
      pending,
    };
  }, [rows, todayStr]);

  const openDrillDown = (title, rows) => {
    setDrillTitle(title);
    setDrillRows(Array.isArray(rows) ? rows : []);
    setDrillOpen(true);
    console.log("Drill rows payload:", rows);
  };

  if (showCourierPage) {
    return <DayEndCourierPage onBack={() => setShowCourierPage(false)} />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4">
      {/* Title */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Day End</h1>
          <div className="mt-1 text-xs text-gray-500">
            Date: <b>{todayStr}</b>
          </div>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="h-8 rounded-md border px-3 text-xs hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
      {loading && <div className="mt-3 text-xs text-gray-500">Loading…</div>}

      {/* ✅ Top stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <div
        onClick={() => openDrillDown("Invoices Today", invoicesTodayList)}
            className="cursor-pointer rounded-lg border bg-white p-3 hover:bg-gray-50"
            >
            <div className="text-[11px] text-gray-500">Invoices Today</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
                {invoicesTodayList.length}
            </div>
            </div>

        <div
            onClick={() => openDrillDown("Previous Days Invoice", previousDaysList)}
            className="cursor-pointer rounded-lg border bg-white p-3 hover:bg-gray-50"
            >
            <div className="text-[11px] text-gray-500">Previous Days Invoice</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
                {previousDaysList.length}
            </div>
            </div>

        <div className="rounded-lg border bg-white p-3">
            <div className="text-[11px] text-gray-500">Total Invoices</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">{stats.totalInvoices}</div>
        </div>

        <div
            onClick={() => openDrillDown("Packed (today)", packedTodayList)}
            className="cursor-pointer rounded-lg border bg-white p-3 hover:bg-gray-50"
            >
            <div className="text-[11px] text-gray-500">Packed</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
                {packedTodayList.length}
            </div>
            </div>

        <div
        onClick={() => openDrillDown("Pending", pendingList)}
        className="cursor-pointer rounded-lg border bg-white p-3 hover:bg-gray-50"
        >
        <div className="text-[11px] text-gray-500">Pending</div>
        <div className="mt-1 text-lg font-semibold text-gray-900">
            {pendingList.length}
        </div>
        </div>
      </div>

      {/* Step 1: range input */}
      <div className="mt-4 rounded-lg border bg-white p-4">
        <div className="text-sm font-semibold text-gray-900">Step 1 — Check missed invoices</div>
        <div className="mt-1 text-xs text-gray-500">
          Enter start & end invoice numbers (numeric part only is checked).
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            value={range.startInvoice}
            onChange={(e) => setRange((p) => ({ ...p, startInvoice: e.target.value }))}
            placeholder="Start invoice (e.g. SA000001)"
            className="h-10 rounded-md border px-3 text-sm outline-none focus:border-indigo-600"
          />

          <input
            value={range.endInvoice}
            onChange={(e) => setRange((p) => ({ ...p, endInvoice: e.target.value }))}
            placeholder="End invoice (e.g. SA000120)"
            className="h-10 rounded-md border px-3 text-sm outline-none focus:border-indigo-600"
          />

          <button
            type="button"
            onClick={onCheckMissing}
            className="h-10 rounded-md bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Check Missing
          </button>

          <button
            type="button"
            onClick={() => setShowCourierPage(true)}
            disabled={missingList.length > 0}
            className="h-9 rounded-md bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
            Go to Courier Page
            </button>

        </div>

        {rangeError && <div className="mt-2 text-xs text-red-600">{rangeError}</div>}

        {missingList.length > 0 && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-amber-900">
                Missing invoices ({missingList.length})
              </div>
              <button
                type="button"
                onClick={() => setAddInvoiceOpen(true)}
                className="h-8 rounded-md bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-700"
              >
                Add Missing Invoice
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {missingList.slice(0, 40).map((x) => (
                <span
                  key={x}
                  className="rounded-full border bg-white px-2 py-0.5 text-[11px] text-gray-700"
                >
                  {x}
                </span>
              ))}
              {missingList.length > 40 && (
                <span className="text-[11px] text-amber-900">+{missingList.length - 40} more</span>
              )}
            </div>
          </div>
        )}

        {!rangeError && missingList.length === 0 && range.startInvoice && range.endInvoice && (
          <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-xs text-green-900">
            No missing invoices in this range ✅
          </div>
        )}
      </div>

      {/* Add Invoice modal */}
      <AddInvoiceModal
        open={addInvoiceOpen}
        onClose={() => setAddInvoiceOpen(false)}
        currentUsername="" // optional if your modal needs it; can pass current user name here
        rowsToday={rowsTodayByInvoiceDate}
        onSaved={async () => {
          await refresh();
          // after creating invoice, re-check missing and refresh top counters
          recomputeMissing(range);
        }}
      />

        {drillOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
            <div className="w-full max-w-4xl rounded-lg bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">
                {drillTitle} ({drillRows.length})
                </h2>
                <button
                onClick={() => setDrillOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                >
                ✕
                </button>
            </div>

            <div className="mt-4 overflow-auto max-h-[60vh] rounded-md border">
                <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-3 py-2 text-left">Invoice</th>
                    <th className="px-3 py-2 text-left">Customer</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Invoice Date</th>
                    <th className="px-3 py-2 text-left">Packed At</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(drillRows) && drillRows.map((r) => (
                    <tr key={r.invoice_id} className="border-t">
                        <td className="px-3 py-2 font-semibold">{r.invoice_number}</td>
                        <td className="px-3 py-2">{r.customer_name}</td>
                        <td className="px-3 py-2">{r.status}</td>
                        <td className="px-3 py-2">{dateOnly(r.invoice_date) || "-"}</td>
                        <td className="px-3 py-2">{dateOnly(r.pack_completed_at) || "-"}</td>
                    </tr>
                    ))}

                    {drillRows.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                        No invoices
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-end">
                <button
                onClick={() => setDrillOpen(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                >
                Close
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
};

export default DayEndPage;
