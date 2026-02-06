import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../../context/authContext";

import { useInvoicesToday } from "../../hooks/packing/useInvoicesToday";
import { usePackingActions } from "../../hooks/packing/usePackingActions";

import PackingTopBar from "../../components/packing/PackingTopBar";
import SimpleTabs from "../../components/packing/SimpleTabs";
import InvoiceList from "../../components/packing/InvoiceList";

import CustomerModal from "../../components/packing/customers/CustomerModal";
import AddInvoiceModal from "../../components/packing/invoices/AddInvoiceModal";
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

const BillingStaffPacking = () => {
  const { currentUser } = useContext(AuthContext);
  const currentUsername = String(currentUser?.username || "").trim();
  const [timelineOpen, setTimelineOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(TAB.MY_JOB);

  const [customerOpen, setCustomerOpen] = useState(false);
  const [addInvoiceOpen, setAddInvoiceOpen] = useState(false);

  const { rows, loading, error, refresh } = useInvoicesToday();
  const actions = usePackingActions({ currentUsername, refresh });

  // ✅ derive lists from the same /today dataset
  const myJob = useMemo(() => getMyJob(rows, currentUsername), [rows, currentUsername]);
  const toTake = useMemo(() => getToTake(rows), [rows]);
  const toVerify = useMemo(() => getToVerify(rows), [rows]);

  const myJobCount = myJob.length;
  const disableStartButtons = myJobCount >= 2;

  // ✅ header totals are based on take_completed_at / pack_completed_at from same /today rows
  const totals = useMemo(() => getMyHeaderTotals(rows, currentUsername), [rows, currentUsername]);

  const tabCounts = useMemo(
    () => ({
      [TAB.MY_JOB]: myJob.length,
      [TAB.TO_TAKE]: toTake.length,
      [TAB.TO_VERIFY]: toVerify.length,
    }),
    [myJob.length, toTake.length, toVerify.length]
  );

  const tabs = useMemo(
    () => [
      { key: TAB.MY_JOB, label: "My Job" },
      { key: TAB.TO_TAKE, label: "To Take" },
      { key: TAB.TO_VERIFY, label: "To Verify" },
    ],
    []
  );

  const currentList = useMemo(() => {
    if (activeTab === TAB.MY_JOB) return myJob;
    if (activeTab === TAB.TO_TAKE) return toTake;
    return toVerify;
  }, [activeTab, myJob, toTake, toVerify]);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4">
      <PackingTopBar
        title="Packing"
        username={currentUsername}
        totals={totals}
        onRefresh={refresh}
        rightActions={
          <>
            <button
              type="button"
              onClick={() => setCustomerOpen(true)}
              className="h-8 rounded-md border px-3 text-xs hover:bg-gray-50"
            >
              Customers
            </button>

            <button
              type="button"
              onClick={() => setAddInvoiceOpen(true)}
              className="h-8 rounded-md bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-700"
            >
              Add Bills
            </button>
          </>
        }
        onOpenTimeline={() => setTimelineOpen(true)}
      />

      {disableStartButtons && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          You already have <span className="font-semibold">2 invoices</span> in progress. Finish one to start another.
        </div>
      )}

      {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
      {loading && <div className="mt-3 text-xs text-gray-500">Loading…</div>}

      {/* ✅ tabs same as packing staff */}
      <SimpleTabs tabs={tabs} active={activeTab} onChange={setActiveTab} counts={tabCounts} />

      {/* ✅ list same as packing staff */}
      <div className="mt-4">
        <InvoiceList
          list={currentList}
          mode={
            activeTab === TAB.MY_JOB ? "MY_JOB" : activeTab === TAB.TO_TAKE ? "TO_TAKE" : "TO_VERIFY"
          }
          loading={loading}
          currentUsername={currentUsername}
          actions={{
            ...actions,
            // keep UX: after starting taking/verifying, jump to My Job
            startTaking: async (id) => {
              await actions.startTaking(id);
              setActiveTab(TAB.MY_JOB);
            },
            startVerify: async (id) => {
              await actions.startVerify(id);
              setActiveTab(TAB.MY_JOB);
            },
          }}
          disableActions={
            activeTab === TAB.TO_TAKE
              ? disableStartButtons
              : activeTab === TAB.TO_VERIFY
              ? false
              : false
          }
          disableVerifyStartForRow={(it) => {
            if (activeTab !== TAB.TO_VERIFY) return false;

            const takenByMe = String(it.taken_by || "").trim() === currentUsername;

            // ✅ same rule as packing staff
            return disableStartButtons || takenByMe;
          }}
          emptyText="No bills"
        />
      </div>

      {/* Modals */}
      <CustomerModal
        open={customerOpen}
        onClose={() => setCustomerOpen(false)}
        onRefresh={refresh}
      />

      <AddInvoiceModal
        open={addInvoiceOpen}
        onClose={() => setAddInvoiceOpen(false)}
        currentUsername={currentUsername}
        rowsToday={rows}
        onSaved={refresh}
      />
      <StaffTimelineModal
        open={timelineOpen}
        onClose={() => setTimelineOpen(false)}
        username={currentUsername}
      />
    </div>
  );
};

export default BillingStaffPacking;
