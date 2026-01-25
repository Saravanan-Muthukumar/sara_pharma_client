import { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext";

import InvoiceCard from "../components/packing/InvoiceCard";
import PackingHeader from "../components/packing/PackingHeader";
import DatePicker from "../components/packing/DatePicker";
import { API, FILTERS } from "../components/packing/packingUtils";

const Packaging = () => {
  const { currentUser } = useContext(AuthContext);
  const isAdmin = currentUser?.role === "admin";

  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("TAKING_IN_PROGRESS");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [loading, setLoading] = useState(false);

  /* =====================
     LOAD DATA
  ===================== */
  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/packing`, {
        params: { date: selectedDate }
      });
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedDate]);

  /* =====================
     FILTER ITEMS
  ===================== */
  const filteredItems = useMemo(() => {
    const f = FILTERS.find((x) => x.key === activeFilter);
    if (!f || !f.statuses) return items;
    return items.filter((it) => f.statuses.includes(it.status));
  }, [items, activeFilter]);

  /* =====================
     ACTION HANDLERS
  ===================== */
  const markTaken = async (invoice_id) => {
    await axios.post(`${API}/packing/save`, {
      invoice_id,
      status: "TAKING_DONE",
    });
    load();
  };

  const markPacked = async (invoice_id) => {
    await axios.post(`${API}/packing/save`, {
      invoice_id,
      status: "COMPLETED",
    });
    load();
  };

  const openVerify = async (invoice) => {
    const verifier = prompt("Verifier name");
    if (!verifier) return;

    await axios.post(`${API}/packing/save`, {
      invoice_id: invoice.invoice_id,
      status: "VERIFY_IN_PROGRESS",
      verifier_name: verifier,
    });
    load();
  };

  const editInvoice = (invoice) => {
    alert(`Edit invoice ${invoice.invoice_number}`);
  };

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-4">
      {/* HEADER */}
      <PackingHeader
        isAdmin={isAdmin}
        onOpenReport={() => alert("Report")}
        onOpenCreate={() => alert("Add Invoice")}
      />

      {/* DATE */}
      <DatePicker
        selectedDate={selectedDate}
        onChange={setSelectedDate}
      />

      {/* STATUS TABS (STRAIGHT EDGES) */}
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
          <p className="text-center text-xs text-gray-500">
            No invoices
          </p>
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
    </div>
  );
};

export default Packaging;
