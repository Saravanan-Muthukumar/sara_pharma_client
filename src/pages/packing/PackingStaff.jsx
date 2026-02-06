// src/pages/packing/PackingStaff.jsx
import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../../context/authContext";

import { useInvoicesToday } from "../../hooks/packing/useInvoicesToday";
import { usePackingActions } from "../../hooks/packing/usePackingActions";

import PackingTopBar from "../../components/packing/PackingTopBar";
import SimpleTabs from "../../components/packing/SimpleTabs";
import InvoiceList from "../../components/packing/InvoiceList";
import StaffTimelineModal from "../../components/packing/StaffTimelineModal";

import {
  getMyJob,
  getToTake,
  getToVerify,
  getMyHeaderTotals,
} from "../../components/packing/packingSelectors";

const TAB = {
  MY_JOB: "MY_JOB",
  TO_TAKE: "TO_TAKE",
  TO_VERIFY: "TO_VERIFY",
};

const PackingStaff = () => {
  const { currentUser } = useContext(AuthContext);
  const currentUsername = String(currentUser?.username || "").trim();

  const [activeTab, setActiveTab] = useState(TAB.MY_JOB);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const { rows, loading, error, refresh } = useInvoicesToday();
  const actions = usePackingActions({ currentUsername, refresh });
  const sortAscByInvoice = (arr) =>
  [...(arr || [])].sort((a, b) =>
    String(a.invoice_number || "").localeCompare(String(b.invoice_number || ""))
  );

  // Lists derive from the SAME dataset (rows from /today)
  const myJob = useMemo(() => sortAscByInvoice(getMyJob(rows, currentUsername)), [rows, currentUsername]);
  const toTake = useMemo(() => sortAscByInvoice(getToTake(rows)), [rows]);
  const toVerify = useMemo(() => sortAscByInvoice(getToVerify(rows)), [rows]);

  const myJobCount = myJob.length;
  const disableStartButtons = myJobCount >= 2;

  const totals = useMemo(() => getMyHeaderTotals(rows, currentUsername), [rows, currentUsername]);

  const tabCounts = useMemo(
    () => ({
      [TAB.MY_JOB]: myJob.length,
      [TAB.TO_TAKE]: toTake.length,
      [TAB.TO_VERIFY]: toVerify.length,
    }),
    [myJob.length, toTake.length, toVerify.length]
  );

  const currentList = useMemo(() => {
    if (activeTab === TAB.MY_JOB) return myJob;
    if (activeTab === TAB.TO_TAKE) return toTake;
    return toVerify;
  }, [activeTab, myJob, toTake, toVerify]);

  const tabs = [
    { key: TAB.MY_JOB, label: "My Job" },
    { key: TAB.TO_TAKE, label: "To Take" },
    { key: TAB.TO_VERIFY, label: "To Verify" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4">
      <PackingTopBar title="Packing" username={currentUsername} totals={totals} onRefresh={refresh} onOpenTimeline={() => setTimelineOpen(true)} />

      {disableStartButtons && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          You already have <span className="font-semibold">2 invoices</span> in progress. Finish one to start another.
        </div>
      )}

      {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
      {loading && <div className="mt-3 text-xs text-gray-500">Loading…</div>}

      <SimpleTabs tabs={tabs} active={activeTab} onChange={setActiveTab} counts={tabCounts} />

      <div className="mt-4">
        <InvoiceList
          list={currentList}
          mode={activeTab === TAB.MY_JOB ? "MY_JOB" : activeTab === TAB.TO_TAKE ? "TO_TAKE" : "TO_VERIFY"}
          loading={loading}
          currentUsername={currentUsername}
          actions={{
            ...actions,
            // keep the UX behavior from your previous version:
            startTaking: async (id) => {
              await actions.startTaking(id);
              setActiveTab(TAB.MY_JOB);
            },
            startVerify: async (id) => {
              await actions.startVerify(id);
              setActiveTab(TAB.MY_JOB);
            },
          }}
          disableActions={activeTab === TAB.TO_TAKE ? disableStartButtons : false}
          disableVerifyStartForRow={(it) => {
            if (activeTab !== TAB.TO_VERIFY) return false;
            const takenByMe = String(it.taken_by || "").trim() === currentUsername;
            return disableStartButtons || takenByMe;
          }}
        />
      </div>
      <StaffTimelineModal
        open={timelineOpen}
        onClose={() => setTimelineOpen(false)}
        username={currentUsername}
      />
    </div>
  );
};

export default PackingStaff;
