// src/pages/PackingStaff.jsx
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import InvoiceCard from "../../components/packing/InvoiceCard";
import { API } from "../../components/packing/packingUtils";

const PackingStaff = () => {
  const { currentUser } = useContext(AuthContext);
  const currentUsername = String(currentUser?.username || "").trim();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const [myJob, setMyJob] = useState([]);
  const [toTake, setToTake] = useState([]);
  const [toVerify, setToVerify] = useState([]);

  const [allBills, setAllBills] = useState([]);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("mine"); // mine | all

  const activeCount = myJob.length;
  const disableStartButtons = activeCount >= 2;

  const load = useCallback(async () => {
    if (!currentUsername) return;
    setLoading(true);
    try {
      const [jobRes, takeRes, verifyRes, allRes] = await Promise.all([
        axios.get(`${API}/api/me/job`, { params: { username: currentUsername } }),
        axios.get(`${API}/api/me/bills-to-take`, { params: { date: selectedDate } }),
        axios.get(`${API}/api/me/bills-to-verify`, {
          params: { date: selectedDate, username: currentUsername },
        }),
        axios.get(`${API}/api/packing`, {
          params: { date: selectedDate, search, scope, username: currentUsername, status: "ALL" },
        }),
      ]);

      setMyJob(jobRes.data || []);
      setToTake(takeRes.data || []);
      setToVerify(verifyRes.data || []);
      setAllBills(allRes.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Load failed", err);
      alert(err?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [currentUsername, selectedDate, search, scope]);

  useEffect(() => {
    load();
  }, [load]);

  const startTaking = useCallback(
    async (invoice_id) => {
      await axios.post(`${API}/api/packing/start-taking`, { invoice_id, username: currentUsername });
      load();
    },
    [currentUsername, load]
  );

  const markTaken = useCallback(
    async (invoice_id) => {
      await axios.post(`${API}/api/packing/mark-taken`, { invoice_id, username: currentUsername });
      load();
    },
    [currentUsername, load]
  );

  const startVerify = useCallback(
    async (invoice_id) => {
      await axios.post(`${API}/api/packing/start-verify`, { invoice_id, username: currentUsername });
      load();
    },
    [currentUsername, load]
  );

  const markPacked = useCallback(
    async (invoice_id) => {
      await axios.post(`${API}/api/packing/mark-packed`, { invoice_id, username: currentUsername });
      load();
    },
    [currentUsername, load]
  );

  const myJobTitle = useMemo(() => {
    if (activeCount === 0) return "My Job (No active task)";
    return `My Job (${activeCount}/2 active)`;
  }, [activeCount]);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold text-gray-900">Packing</h1>
        <div className="text-xs text-gray-600">{currentUsername || "-"}</div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-8 rounded-md border px-2 text-xs"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search invoice / customer"
          className="h-8 flex-1 rounded-md border px-2 text-xs"
        />

        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="h-8 rounded-md border px-2 text-xs"
        >
          <option value="mine">Mine</option>
          <option value="all">All (read-only)</option>
        </select>

        <button
          type="button"
          onClick={load}
          className="h-8 rounded-md border px-3 text-xs hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {disableStartButtons && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          You already have <span className="font-semibold">2 invoices</span> in progress. Finish one to start another.
        </div>
      )}

      {loading && <div className="mt-3 text-xs text-gray-500">Loading…</div>}

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="text-xs font-semibold text-gray-900">{myJobTitle}</div>
          <div className="mt-2 space-y-3">
            {myJob.length === 0 ? (
              <div className="rounded-md border bg-white p-3 text-xs text-gray-500">
                No active invoice. Start from “Bills to Take” or “Bills to Verify & Pack”.
              </div>
            ) : (
              myJob.map((it) => (
                <InvoiceCard
                  key={it.invoice_id}
                  it={it}
                  mode="MY_JOB"
                  currentUsername={currentUsername}
                  onMarkTaken={markTaken}
                  onMarkPacked={markPacked}
                />
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="text-xs font-semibold text-gray-900">Bills to Take</div>
          <div className="mt-2 space-y-3">
            {toTake.length === 0 ? (
              <div className="rounded-md border bg-white p-3 text-xs text-gray-500">No bills to take</div>
            ) : (
              toTake.map((it) => (
                <InvoiceCard
                  key={it.invoice_id}
                  it={it}
                  mode="TO_TAKE"
                  currentUsername={currentUsername}
                  onStartTaking={startTaking}
                  disableActions={disableStartButtons}
                />
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="text-xs font-semibold text-gray-900">Bills to Verify &amp; Pack</div>
          <div className="mt-2 space-y-3">
            {toVerify.length === 0 ? (
              <div className="rounded-md border bg-white p-3 text-xs text-gray-500">No bills to verify</div>
            ) : (
              toVerify.map((it) => (
                <InvoiceCard
                  key={it.invoice_id}
                  it={it}
                  mode="TO_VERIFY"
                  currentUsername={currentUsername}
                  onStartVerify={startVerify}
                  disableActions={disableStartButtons}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-xs font-semibold text-gray-900">All Bills</div>
        <div className="mt-2 space-y-3">
          {allBills.length === 0 ? (
            <div className="rounded-md border bg-white p-3 text-xs text-gray-500">No bills found</div>
          ) : (
            allBills.map((it) => (
              <InvoiceCard key={it.invoice_id} it={it} mode="ALL" currentUsername={currentUsername} disableActions />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PackingStaff;
