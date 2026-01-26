// src/pages/packing/AdminPacking.jsx
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import InvoiceCard from "../../components/packing/InvoiceCard";
import { API } from "../../components/packing/packingUtils"

const AdminPacking = () => {
  const { currentUser } = useContext(AuthContext);
  const currentUsername = String(currentUser?.username || "").trim();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [allBills, setAllBills] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/packing`, {
        params: { date: selectedDate, status: "ALL" },
      });
      setAllBills(res.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Load failed", err);
      alert(err?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(() => {
    const g = {
      TO_TAKE: [],
      TAKING: [],
      TO_VERIFY: [],
      VERIFYING: [],
      PACKED: [],
      ALL: allBills,
    };

    for (const it of allBills) {
      const st = String(it.status || "").trim();
      if (g[st]) g[st].push(it);
    }
    return g;
  }, [allBills]);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold text-gray-900">Packing (Admin)</h1>
        <div className="text-xs text-gray-600">{currentUsername || "-"}</div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-8 rounded-md border px-2 text-xs"
        />

        <button
          type="button"
          onClick={load}
          className="h-8 rounded-md border px-3 text-xs hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <div className="mt-3 rounded-md border bg-white p-3 text-xs text-gray-600">
        Admin view is read-only. (No action buttons)
      </div>

      {loading && <div className="mt-3 text-xs text-gray-500">Loading…</div>}

      {/* KPI */}
      <div className="mt-4 rounded-lg border bg-white p-3 shadow-sm">
        <div className="grid grid-cols-5 gap-2 text-center">
          <div className="rounded-md bg-gray-50 p-2">
            <div className="text-[11px] text-gray-500">To Take</div>
            <div className="text-sm font-semibold text-gray-900">{groups.TO_TAKE.length}</div>
          </div>
          <div className="rounded-md bg-gray-50 p-2">
            <div className="text-[11px] text-gray-500">Taking</div>
            <div className="text-sm font-semibold text-gray-900">{groups.TAKING.length}</div>
          </div>
          <div className="rounded-md bg-gray-50 p-2">
            <div className="text-[11px] text-gray-500">To Verify</div>
            <div className="text-sm font-semibold text-gray-900">{groups.TO_VERIFY.length}</div>
          </div>
          <div className="rounded-md bg-gray-50 p-2">
            <div className="text-[11px] text-gray-500">Verifying</div>
            <div className="text-sm font-semibold text-gray-900">{groups.VERIFYING.length}</div>
          </div>
          <div className="rounded-md border border-teal-200 bg-teal-50 p-2">
            <div className="text-[11px] text-teal-700">Packed</div>
            <div className="text-sm font-semibold text-teal-900">{groups.PACKED.length}</div>
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="mt-6 space-y-6">
        <div>
          <div className="text-xs font-semibold text-gray-900">
            To Take ({groups.TO_TAKE.length})
          </div>
          <div className="mt-2 space-y-3">
            {groups.TO_TAKE.length === 0 ? (
              <div className="rounded-md border bg-white p-3 text-xs text-gray-500">None</div>
            ) : (
              groups.TO_TAKE.map((it) => (
                <InvoiceCard
                  key={it.invoice_id}
                  it={it}
                  mode="ALL"
                  currentUsername={currentUsername}
                  disableActions
                />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-900">
            Taking Now ({groups.TAKING.length})
          </div>
          <div className="mt-2 space-y-3">
            {groups.TAKING.length === 0 ? (
              <div className="rounded-md border bg-white p-3 text-xs text-gray-500">None</div>
            ) : (
              groups.TAKING.map((it) => (
                <InvoiceCard
                  key={it.invoice_id}
                  it={it}
                  mode="ALL"
                  currentUsername={currentUsername}
                  disableActions
                />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-900">
            To Verify &amp; Pack ({groups.TO_VERIFY.length})
          </div>
          <div className="mt-2 space-y-3">
            {groups.TO_VERIFY.length === 0 ? (
              <div className="rounded-md border bg-white p-3 text-xs text-gray-500">None</div>
            ) : (
              groups.TO_VERIFY.map((it) => (
                <InvoiceCard
                  key={it.invoice_id}
                  it={it}
                  mode="ALL"
                  currentUsername={currentUsername}
                  disableActions
                />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-900">
            Verifying Now ({groups.VERIFYING.length})
          </div>
          <div className="mt-2 space-y-3">
            {groups.VERIFYING.length === 0 ? (
              <div className="rounded-md border bg-white p-3 text-xs text-gray-500">None</div>
            ) : (
              groups.VERIFYING.map((it) => (
                <InvoiceCard
                  key={it.invoice_id}
                  it={it}
                  mode="ALL"
                  currentUsername={currentUsername}
                  disableActions
                />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-900">
            Packed ({groups.PACKED.length})
          </div>
          <div className="mt-2 space-y-3">
            {groups.PACKED.length === 0 ? (
              <div className="rounded-md border bg-white p-3 text-xs text-gray-500">None</div>
            ) : (
              groups.PACKED.map((it) => (
                <InvoiceCard
                  key={it.invoice_id}
                  it={it}
                  mode="ALL"
                  currentUsername={currentUsername}
                  disableActions
                />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-900">
            All Bills ({groups.ALL.length})
          </div>
          <div className="mt-2 space-y-3">
            {groups.ALL.length === 0 ? (
              <div className="rounded-md border bg-white p-3 text-xs text-gray-500">None</div>
            ) : (
              groups.ALL.map((it) => (
                <InvoiceCard
                  key={it.invoice_id}
                  it={it}
                  mode="ALL"
                  currentUsername={currentUsername}
                  disableActions
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPacking;
