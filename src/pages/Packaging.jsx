import {
    useEffect,
    useMemo,
    useState,
    useContext,
    useCallback,
  } from "react";
  import axios from "axios";
  import { AuthContext } from "../context/authContext";
  
  import InvoiceCard from "../components/packing/InvoiceCard";
  import { API, FILTERS, toTitleCase } from "../components/packing/packingUtils";
  
  const Packaging = () => {
    const { currentUser } = useContext(AuthContext);
    const isAdmin = currentUser?.role === "admin";
  
    const [items, setItems] = useState([]);
    const [activeFilter, setActiveFilter] = useState("TAKING_IN_PROGRESS");
    const [selectedDate, setSelectedDate] = useState(
      new Date().toISOString().slice(0, 10)
    );
    const [loading, setLoading] = useState(false);
  
    // report modal
    const [reportOpen, setReportOpen] = useState(false);
  
    /* =====================
       LOAD DATA (CI SAFE)
    ===================== */
    const load = useCallback(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/packing`, {
          params: { date: selectedDate },
        });
        setItems(res.data || []);
      } catch (err) {
        console.error("Failed to load packing list", err);
      } finally {
        setLoading(false);
      }
    }, [selectedDate]);
  
    useEffect(() => {
      load();
    }, [load]);
  
    /* =====================
       FILTER ITEMS
    ===================== */
    const filteredItems = useMemo(() => {
      const f = FILTERS.find((x) => x.key === activeFilter);
      if (!f || !f.statuses) return items;
      return items.filter((it) => f.statuses.includes(it.status));
    }, [items, activeFilter]);
  
    /* =====================
       STAFF REPORT (Taken + Verified)
       - Taken: counted by staff_name (who created/took)
       - Verified: counted by verifier_name (who verified)
    ===================== */
    const report = useMemo(() => {
      // Map: name -> { taken, verified }
      const map = new Map();
  
      let grandTaken = 0;
      let grandVerified = 0;
  
      for (const it of items) {
        // TAKEN BY staff_name
        const staffRaw = String(it.staff_name || "").trim();
        const staff = staffRaw ? toTitleCase(staffRaw) : "";
        if (staff) {
          if (!map.has(staff)) map.set(staff, { taken: 0, verified: 0 });
          map.get(staff).taken += 1;
          grandTaken += 1;
        }
  
        // VERIFIED BY verifier_name
        const verRaw = String(it.verifier_name || "").trim();
        const verifier = verRaw ? toTitleCase(verRaw) : "";
        if (verifier) {
          if (!map.has(verifier)) map.set(verifier, { taken: 0, verified: 0 });
          map.get(verifier).verified += 1;
          grandVerified += 1;
        }
      }
  
      const rows = Array.from(map.entries())
        .map(([name, v]) => ({ name, taken: v.taken, verified: v.verified }))
        .sort((a, b) => (b.taken + b.verified) - (a.taken + a.verified));
  
      return { rows, grandTaken, grandVerified };
    }, [items]);
  
    /* =====================
       ACTIONS
    ===================== */
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
      async (invoice) => {
        const verifier = window.prompt("Verifier name");
        if (!verifier) return;
  
        await axios.post(`${API}/packing/save`, {
          invoice_id: invoice.invoice_id,
          status: "VERIFY_IN_PROGRESS",
          verifier_name: verifier,
        });
        load();
      },
      [load]
    );
  
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
  
    const editInvoice = useCallback((invoice) => {
      alert(`Edit invoice ${invoice.invoice_number}`);
    }, []);
  
    /* =====================
       UI
    ===================== */
    return (
      <div className="mx-auto w-full max-w-6xl px-3 py-4">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold text-gray-900">Packing</h1>
  
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setReportOpen(true)}
                className="h-8 rounded-md border px-3 text-xs hover:bg-gray-50"
              >
                Report
              </button>
            )}
  
            <button
              onClick={() => alert("Add Invoice")}
              className="h-8 rounded-md bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-700"
            >
              Add Invoice
            </button>
          </div>
        </div>
  
        {/* DATE (compact) */}
        <div className="mt-3 flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-8 rounded-md border px-2 text-xs"
          />
        </div>
  
        {/* STATUS TABS (straight edges) */}
        <div className="mt-4 w-full overflow-x-auto">
          <div className="inline-flex min-w-max rounded-md border bg-white">
            {FILTERS.map((f, idx) => {
              const active = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={[
                    "px-3 py-2 text-xs whitespace-nowrap transition",
                    idx !== 0 ? "border-l" : "",
                    active
                      ? "bg-teal-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
  
        {/* LIST */}
        <div className="mt-4 space-y-3">
          {loading && (
            <p className="text-center text-xs text-gray-500">Loading…</p>
          )}
  
          {!loading && filteredItems.length === 0 && (
            <p className="text-center text-xs text-gray-500">No invoices found</p>
          )}
  
          {filteredItems.map((it) => (
            <InvoiceCard
              key={it.invoice_id}
              it={it}
              activeFilter={activeFilter}
              onEdit={editInvoice}
              onMarkTaken={markTaken}
              onOpenVerify={openVerify}
              onMarkPacked={markPacked}
            />
          ))}
        </div>
  
        {/* REPORT MODAL */}
        {isAdmin && reportOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 md:items-center">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Staff Report</div>
                  <div className="text-xs text-gray-500">Date: {selectedDate}</div>
                </div>
                <button
                  onClick={() => setReportOpen(false)}
                  className="h-8 rounded-md px-2 text-sm text-gray-600 hover:bg-gray-100"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
  
              <div className="px-4 py-3">
                {/* Grand totals */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Grand Taken</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {report.grandTaken}
                    </div>
                  </div>
                  <div className="rounded-md border bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Grand Verified</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {report.grandVerified}
                    </div>
                  </div>
                </div>
  
                {/* Table */}
                <div className="mt-3 overflow-hidden rounded-md border">
                  <div className="grid grid-cols-12 bg-gray-100 px-3 py-2 text-[11px] text-gray-700">
                    <div className="col-span-6">Staff</div>
                    <div className="col-span-3 text-right">Taken</div>
                    <div className="col-span-3 text-right">Verified</div>
                  </div>
  
                  {report.rows.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-gray-500">
                      No data for this date
                    </div>
                  ) : (
                    report.rows.map((r) => (
                      <div
                        key={r.name}
                        className="grid grid-cols-12 border-t px-3 py-2 text-sm"
                      >
                        <div className="col-span-6 truncate text-gray-900">
                          {r.name}
                        </div>
                        <div className="col-span-3 text-right text-gray-700">
                          {r.taken}
                        </div>
                        <div className="col-span-3 text-right text-gray-700">
                          {r.verified}
                        </div>
                      </div>
                    ))
                  )}
                </div>
  
                <div className="mt-3 flex justify-end">
                  <button
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
  