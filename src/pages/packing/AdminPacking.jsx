// src/pages/packing/AdminPacking.jsx
import { Link } from "react-router-dom";
import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../../context/authContext";

import { useInvoicesToday } from "../../hooks/useInvoicesToday";

import PackingTopBar from "../../components/packing/PackingTopBar";
import SimpleTabs from "../../components/packing/SimpleTabs";
import InvoiceList from "../../components/packing/InvoiceList";

import CustomerModal from "../../components/packing/CustomerModal";
import AddInvoiceModal from "../../components/packing/AddInvoiceModal";

import StaffReportModal from "../../components/packing/StaffReportModal";

import { BILLING_TABS } from "../../components/packing/packingUtils";
import { getBillingCounts, getBillingListByTab } from "../../components/packing/billingSelectors";
import { buildStaffReport } from "../../components/packing/packingUtils";
import AdminTimelineModal from "../../components/packing/AdminTimelineModal";


const AdminPacking = () => {
  const { currentUser } = useContext(AuthContext);
  const currentUsername = String(currentUser?.username || "").trim();
  const isAdmin = String(currentUser?.role || "").toLowerCase() === "admin";

  const [activeTab, setActiveTab] = useState("OUTSTANDING");

  const [customerOpen, setCustomerOpen] = useState(false);
  const [addInvoiceOpen, setAddInvoiceOpen] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);

  // today string for modal header (matches /api/invoices/today)
  const selectedDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const { rows, loading, error, refresh } = useInvoicesToday();

  const tabs = useMemo(
    () =>
      BILLING_TABS
        .filter((t) => t.key !== "UNPRINTED") // remove if you don't want it
        .map((t) => ({ key: t.key, label: t.label })),
    []
  );

  const tabCounts = useMemo(() => getBillingCounts(rows), [rows]);

  // const currentList = useMemo(() => getBillingListByTab(rows, activeTab), [rows, activeTab]);

  const currentList = useMemo(() => {
    const list = getBillingListByTab(rows, activeTab);
  
    // 🔽 ALL bills → descending
    if (activeTab === "ALL") {
      return [...(list || [])].sort((a, b) =>
        String(b.invoice_number || "").localeCompare(String(a.invoice_number || ""))
      );
    }
  
    // 🔼 other tabs → ascending
    return [...(list || [])].sort((a, b) =>
      String(a.invoice_number || "").localeCompare(String(b.invoice_number || ""))
    );
  }, [rows, activeTab]);

  // ✅ use completed_at fields in report (your rules)
  const report = useMemo(() => buildStaffReport(rows), [rows]);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4">
      <PackingTopBar
        title="Packing"
        username={currentUsername}
        totals={null}
        onRefresh={refresh}
        rightActions={
          <>
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
            <Link
              to="/packing/dayend"
              className="inline-flex h-8 items-center rounded-md bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Day End
            </Link>
          </>
          
        }
        onOpenTimeline={() => setTimelineOpen(true)}
      />

      {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
      {loading && <div className="mt-3 text-xs text-gray-500">Loading…</div>}

      {/* ✅ Status tabs (all statuses from packingUtils) */}
      <SimpleTabs tabs={tabs} active={activeTab} onChange={setActiveTab} counts={tabCounts} />

      {/* ✅ Read-only list (no action buttons) */}
      <div className="mt-4">
        <InvoiceList
          list={currentList}
          mode="ALL"
          loading={loading}
          currentUsername={currentUsername}
          readOnly
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

      {/* ✅ Existing StaffReportModal */}
      <StaffReportModal
        open={reportOpen}
        isAdmin={isAdmin}
        selectedDate={selectedDate}
        report={report}
        onClose={() => setReportOpen(false)}
      />
      <AdminTimelineModal
        open={timelineOpen}
        onClose={() => setTimelineOpen(false)}
        username={currentUsername}
      />
    </div>

    
  );
};

export default AdminPacking;
