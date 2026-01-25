// src/pages/Packaging.jsx
import { useEffect, useMemo, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext";

import InvoiceCard from "../components/packing/InvoiceCard";
import AddEditInvoiceForm from "../components/packing/AddEditInvoiceForm";
import VerifyModal from "../components/packing/VerifyModal";

import { API, FILTERS, toTitleCase } from "../components/packing/packingUtils";

const Packaging = () => {
  const { currentUser } = useContext(AuthContext);
  const isAdmin = currentUser?.role === "admin";
  const currentUsername = String(currentUser?.username || "").trim();

  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("TAKING_IN_PROGRESS");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  // report modal
  const [reportOpen, setReportOpen] = useState(false);

  // add/edit form
  const [formOpen, setFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    invoiceNumber: "",
    noOfProducts: "",
    customerName: "",
    courierName: "",
    invoiceValue: "",
    takenBy: "",
  });

  // verify modal
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyInvoice, setVerifyInvoice] = useState(null);
  const [verifyStaffName, setVerifyStaffName] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySaving, setVerifySaving] = useState(false);

  /* =====================
     LOAD (CI SAFE)
  ===================== */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/packing`, { params: { date: selectedDate } });
      setItems(res.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load packing list", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  /* =====================
     COUNTS FOR TABS
  ===================== */
  const statusCounts = useMemo(() => {
    const counts = {
      TAKING_IN_PROGRESS: 0,
      TAKING_DONE: 0,
      VERIFY_IN_PROGRESS: 0,
      COMPLETED: 0,
      ALL: items.length,
    };

    for (const it of items) {
      if (it.status === "TAKING_IN_PROGRESS") counts.TAKING_IN_PROGRESS += 1;
      else if (it.status === "TAKING_DONE") counts.TAKING_DONE += 1;
      else if (it.status === "VERIFY_IN_PROGRESS") counts.VERIFY_IN_PROGRESS += 1;
      else if (it.status === "COMPLETED") counts.COMPLETED += 1;
    }
    return counts;
  }, [items]);

  const filterCount = useCallback(
    (filterKey) => {
      if (filterKey === "ALL") return statusCounts.ALL;
      const f = FILTERS.find((x) => x.key === filterKey);
      if (!f || !f.statuses) return statusCounts.ALL;
      return f.statuses.reduce((sum, s) => sum + (statusCounts[s] || 0), 0);
    },
    [statusCounts]
  );

  /* =====================
     FILTER ITEMS
  ===================== */
  const filteredItems = useMemo(() => {
    const f = FILTERS.find((x) => x.key === activeFilter);
    if (!f || !f.statuses) return items;
    return items.filter((it) => f.statuses.includes(it.status));
  }, [items, activeFilter]);

  /* =====================
     ADD INVOICE GATE (GLOBAL)
     Rule: if To Verify (global) > 1 disable Add Invoice for all except admin
  ===================== */
  const totalToVerifyCount = useMemo(() => {
    return items.filter((it) => it.status === "TAKING_DONE").length;
  }, [items]);

  const canAddInvoice = isAdmin || totalToVerifyCount <= 1;

  /* =====================
     KPI TOTALS ROW
  ===================== */
  const kpi = useMemo(() => {
    const taking = statusCounts.TAKING_IN_PROGRESS;
    const taken = statusCounts.TAKING_DONE;
    const verifying = statusCounts.VERIFY_IN_PROGRESS;
    const packed = statusCounts.COMPLETED;
    const grand = taking + taken + verifying + packed;

    return { taking, taken, verifying, packed, grand };
  }, [statusCounts]);

  /* =====================
     REPORT (per staff)
     Taking+Taken => taken_by
     Verifying+Packed => packed_by
     + totals for 4 states
  ===================== */
  const report = useMemo(() => {
    const map = new Map();

    let totalTaking = 0;
    let totalTaken = 0;
    let totalVerifying = 0;
    let totalPacked = 0;

    const ensure = (name) => {
      if (!map.has(name)) {
        map.set(name, { takingNow: 0, taken: 0, verifyingNow: 0, packed: 0 });
      }
      return map.get(name);
    };

    for (const it of items) {
      const takenBy = toTitleCase(String(it.taken_by || "").trim());
      const packedBy = toTitleCase(String(it.packed_by || "").trim());

      if (it.status === "TAKING_IN_PROGRESS") {
        if (takenBy) ensure(takenBy).takingNow += 1;
        totalTaking += 1;
      } else if (it.status === "TAKING_DONE") {
        if (takenBy) ensure(takenBy).taken += 1;
        totalTaken += 1;
      } else if (it.status === "VERIFY_IN_PROGRESS") {
        if (packedBy) ensure(packedBy).verifyingNow += 1;
        totalVerifying += 1;
      } else if (it.status === "COMPLETED") {
        if (packedBy) ensure(packedBy).packed += 1;
        totalPacked += 1;
      }
    }

    const rows = Array.from(map.entries())
      .map(([name, v]) => ({
        name,
        takingNow: v.takingNow,
        taken: v.taken,
        verifyingNow: v.verifyingNow,
        packed: v.packed,
        total: v.takingNow + v.taken + v.verifyingNow + v.packed,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      rows,
      totals: {
        taking: totalTaking,
        taken: totalTaken,
        verifying: totalVerifying,
        packed: totalPacked,
        grand: totalTaking + totalTaken + totalVerifying + totalPacked,
      },
    };
  }, [items]);

  /* =====================
     ADD / EDIT
  ===================== */
  const openAdd = useCallback(() => {
    setEditingInvoice(null);
    setValues({
      invoiceNumber: "",
      noOfProducts: "",
      customerName: "",
      courierName: "",
      invoiceValue: "",
      takenBy: currentUsername,
    });
    setFormOpen(true);
  }, [currentUsername]);

  const openEdit = useCallback(
    (invoice) => {
      setEditingInvoice(invoice);
      setValues({
        invoiceNumber: String(invoice.invoice_number || "").trim(),
        noOfProducts: String(invoice.no_of_products || "").trim(),
        customerName: String(invoice.customer_name || "").trim(),
        courierName: String(invoice.courier_name || "").trim(),
        invoiceValue:
          invoice.invoice_value === null || invoice.invoice_value === undefined
            ? ""
            : String(invoice.invoice_value),
        takenBy: String(invoice.taken_by || "").trim() || currentUsername,
      });
      setFormOpen(true);
    },
    [currentUsername]
  );

  const closeForm = useCallback(() => {
    if (saving) return;
    setFormOpen(false);
    setEditingInvoice(null);
  }, [saving]);

  const saveForm = useCallback(async () => {
    const invoiceNumber = String(values.invoiceNumber || "").trim();
    const noOfProducts = String(values.noOfProducts || "").trim();
    const customerName = String(values.customerName || "").trim();
    const courierName = String(values.courierName || "").trim();
    const invoiceValueRaw = String(values.invoiceValue || "").trim();
    const takenBy = String(isAdmin ? values.takenBy : currentUsername).trim();

    if (!invoiceNumber || !noOfProducts || !customerName || !courierName || !takenBy) {
      alert("Please fill all required fields (*)");
      return;
    }
    if (!currentUsername) {
      alert("User not found. Please login again.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        invoice_number: invoiceNumber,
        no_of_products: Number(noOfProducts),
        customer_name: customerName,
        courier_name: courierName,
        invoice_value: invoiceValueRaw ? Number(invoiceValueRaw) : null,
        taken_by: takenBy,
      };

      if (editingInvoice?.invoice_id) {
        await axios.post(`${API}/packing/save`, {
          ...payload,
          invoice_id: editingInvoice.invoice_id,
        });
      } else {
        await axios.post(`${API}/packing/save`, {
          ...payload,
          status: "TAKING_IN_PROGRESS",
          taken_by: takenBy,
        });
      }

      setFormOpen(false);
      setEditingInvoice(null);
      load();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Save invoice failed", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to save invoice";
      alert(String(msg));
    } finally {
      setSaving(false);
    }
  }, [values, editingInvoice, currentUsername, isAdmin, load]);

  /* =====================
     ACTIONS
  ===================== */
  // Do NOT send taken_by here (prevents admin overwriting existing taken_by)
  const markTaken = useCallback(
    async (invoice_id) => {
      await axios.post(`${API}/packing/save`, {
        invoice_id,
        status: "TAKING_DONE",
      });
      load();
    },
    [load]
  );

  const openVerify = useCallback(
    (invoice) => {
      setVerifyError("");
      setVerifyInvoice(invoice);

      const prefill = isAdmin
        ? String(invoice?.packed_by || invoice?.taken_by || currentUsername || "").trim()
        : currentUsername;

      setVerifyStaffName(prefill);
      setVerifyOpen(true);
    },
    [currentUsername, isAdmin]
  );

  const closeVerify = useCallback(() => {
    if (verifySaving) return;
    setVerifyOpen(false);
    setVerifyInvoice(null);
    setVerifyStaffName("");
    setVerifyError("");
  }, [verifySaving]);

  const confirmVerify = useCallback(async () => {
    const invId = verifyInvoice?.invoice_id;
    if (!invId) {
      setVerifyError("Missing invoice id");
      return;
    }

    const staffToSave = String(isAdmin ? verifyStaffName : currentUsername).trim();
    if (!staffToSave) {
      setVerifyError("Staff name is required");
      return;
    }

    setVerifySaving(true);
    setVerifyError("");
    try {
      await axios.post(`${API}/packing/save`, {
        invoice_id: invId,
        status: "VERIFY_IN_PROGRESS",
        packed_by: staffToSave,
      });

      setVerifyOpen(false);
      setVerifyInvoice(null);
      setVerifyStaffName("");

      await load();
      setActiveFilter("VERIFY_IN_PROGRESS");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Verify save failed", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to save";
      setVerifyError(String(msg));
    } finally {
      setVerifySaving(false);
    }
  }, [verifyInvoice, isAdmin, verifyStaffName, currentUsername, load]);

  const markPacked = useCallback(
    async (invoice_id) => {
      await axios.post(`${API}/packing/save`, {
        invoice_id,
        status: "COMPLETED",
      });
      load();
    },
    [load]
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold text-gray-900">Packing</h1>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="h-8 rounded-md border px-3 text-xs hover:bg-gray-50"
            >
              Report
            </button>
          )}

          <button
            type="button"
            onClick={openAdd}
            disabled={!canAddInvoice}
            title={
              !canAddInvoice ? 'Please complete "To Verify" invoices first (global limit: 1).' : ""
            }
            className={[
              "h-8 rounded-md px-3 text-xs font-semibold",
              canAddInvoice
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed",
            ].join(" ")}
          >
            Add Invoice to take stock
          </button>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="mt-3 rounded-lg border bg-white p-3 shadow-sm">
        <div className="grid grid-cols-5 gap-2 text-center">
          <div className="rounded-md bg-gray-50 p-2">
            <div className="text-[11px] text-gray-500">Taking</div>
            <div className="text-sm font-semibold text-gray-900">{kpi.taking}</div>
          </div>
          <div className="rounded-md bg-gray-50 p-2">
            <div className="text-[11px] text-gray-500">Taken</div>
            <div className="text-sm font-semibold text-gray-900">{kpi.taken}</div>
          </div>
          <div className="rounded-md bg-gray-50 p-2">
            <div className="text-[11px] text-gray-500">Verifying</div>
            <div className="text-sm font-semibold text-gray-900">{kpi.verifying}</div>
          </div>
          <div className="rounded-md bg-gray-50 p-2">
            <div className="text-[11px] text-gray-500">Packed</div>
            <div className="text-sm font-semibold text-gray-900">{kpi.packed}</div>
          </div>
          <div className="rounded-md border border-teal-200 bg-teal-50 p-2">
            <div className="text-[11px] text-teal-700">Grand Total</div>
            <div className="text-sm font-semibold text-teal-900">{kpi.grand}</div>
          </div>
        </div>
      </div>

      {/* GLOBAL STAFF WARNING (no JSX typo) */}
      {!isAdmin && totalToVerifyCount > 1 && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          There are <span className="font-semibold">{totalToVerifyCount}</span> invoices in{" "}
          <span className="font-semibold">To Verify</span>. Please finish them before adding new
          invoices.
        </div>
      )}

      {/* ADD/EDIT FORM */}
      <AddEditInvoiceForm
        open={formOpen}
        editingInvoice={editingInvoice}
        isAdmin={isAdmin}
        values={values}
        setValues={setValues}
        onSave={saveForm}
        onCancel={closeForm}
        saving={saving}
      />

      {/* DATE */}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-8 rounded-md border px-2 text-xs"
        />
      </div>

      {/* TABS */}
      <div className="mt-4 w-full overflow-x-auto">
        <div className="inline-flex min-w-max rounded-md border bg-white">
          {FILTERS.map((f, idx) => {
            const active = activeFilter === f.key;
            const count = filterCount(f.key);

            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
                className={[
                  "px-3 py-2 text-xs whitespace-nowrap transition flex items-center gap-2",
                  idx !== 0 ? "border-l" : "",
                  active ? "bg-teal-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                <span>{f.label}</span>
                <span
                  className={[
                    "min-w-[22px] h-5 px-1 rounded-md text-[11px] inline-flex items-center justify-center",
                    active ? "bg-white/20" : "bg-gray-200 text-gray-800",
                  ].join(" ")}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LIST */}
      <div className="mt-4 space-y-3">
        {loading && <p className="text-center text-xs text-gray-500">Loading…</p>}

        {!loading && filteredItems.length === 0 && (
          <p className="text-center text-xs text-gray-500">No invoices found</p>
        )}

        {filteredItems.map((it) => (
          <InvoiceCard
            key={it.invoice_id}
            it={it}
            activeFilter={activeFilter}
            onEdit={openEdit}
            onMarkTaken={markTaken}
            onOpenVerify={openVerify}
            onMarkPacked={markPacked}
            isAdmin={isAdmin}
            currentUsername={currentUsername}
          />
        ))}
      </div>

      {/* VERIFY MODAL */}
      <VerifyModal
        open={verifyOpen}
        invoice={verifyInvoice}
        isAdmin={isAdmin}
        staffName={verifyStaffName}
        setStaffName={setVerifyStaffName}
        error={verifyError}
        onClose={closeVerify}
        onConfirm={confirmVerify}
        saving={verifySaving}
      />

      {/* REPORT MODAL */}
      {isAdmin && reportOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 md:items-center">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">Report</div>
                <div className="text-xs text-gray-500">Date: {selectedDate}</div>
              </div>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="h-8 rounded-md px-2 text-sm text-gray-600 hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="px-4 py-3">
              {/* Totals row */}
              <div className="grid grid-cols-5 gap-2">
                <div className="rounded-md border bg-gray-50 p-2">
                  <div className="text-[11px] text-gray-500">Taking</div>
                  <div className="text-sm font-semibold">{report.totals.taking}</div>
                </div>
                <div className="rounded-md border bg-gray-50 p-2">
                  <div className="text-[11px] text-gray-500">Taken</div>
                  <div className="text-sm font-semibold">{report.totals.taken}</div>
                </div>
                <div className="rounded-md border bg-gray-50 p-2">
                  <div className="text-[11px] text-gray-500">Verifying</div>
                  <div className="text-sm font-semibold">{report.totals.verifying}</div>
                </div>
                <div className="rounded-md border bg-gray-50 p-2">
                  <div className="text-[11px] text-gray-500">Packed</div>
                  <div className="text-sm font-semibold">{report.totals.packed}</div>
                </div>
                <div className="rounded-md border border-teal-200 bg-teal-50 p-2">
                  <div className="text-[11px] text-teal-700">Grand</div>
                  <div className="text-sm font-semibold text-teal-900">{report.totals.grand}</div>
                </div>
              </div>

              {/* Staffwise */}
              <div className="mt-3 overflow-hidden rounded-md border">
                <div className="grid grid-cols-12 bg-gray-100 px-3 py-2 text-[11px] text-gray-700">
                  <div className="col-span-4">Staff</div>
                  <div className="col-span-2 text-right">Taking</div>
                  <div className="col-span-2 text-right">Taken</div>
                  <div className="col-span-2 text-right">Verify</div>
                  <div className="col-span-2 text-right">Packed</div>
                </div>

                {report.rows.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-gray-500">
                    No data for this date
                  </div>
                ) : (
                  report.rows.map((r) => (
                    <div key={r.name} className="grid grid-cols-12 border-t px-3 py-2 text-sm">
                      <div className="col-span-4 truncate text-gray-900">{r.name}</div>
                      <div className="col-span-2 text-right text-gray-700">{r.takingNow}</div>
                      <div className="col-span-2 text-right text-gray-700">{r.taken}</div>
                      <div className="col-span-2 text-right text-gray-700">{r.verifyingNow}</div>
                      <div className="col-span-2 text-right text-gray-700">{r.packed}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="h-8 rounded-md border px-3 text-xs hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packaging;
