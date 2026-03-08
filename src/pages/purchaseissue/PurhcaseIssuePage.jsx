// src/pages/purchase/PurchaseIssuePage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API, toTitleCase } from "../../components/packing/packingUtils";
import SupplierModal from "../../components/purchaseissue/SupplierModal";
import PurchaseIssueFormModal from "../../components/purchaseissue/PurchaseIssueFormModal";
import PurchaseIssueDetailModal from "../../components/purchaseissue/PurchaseIssueDetailModal";

const issueTypeOptions = [
  "SHORTAGE",
  "EXCESS",
  "DAMAGE",
  "WRONG_BATCH",
  "WRONG_MRP",
  "WRONG_RATE",
  "SHORT_EXPIRY",
  "BOX_MISSING",
];

const statusOptions = [
  "OPEN",
  "SUPPLIER_CONTACTED",
  "PENDING_REPLACEMENT",
  "PENDING BILL CHANGE",
  "PENDING_CREDIT_NOTE",
  "CLOSED",
];

const PurchaseIssuePage = () => {
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [issueTypeFilter, setIssueTypeFilter] = useState("");

  const [supplierOpen, setSupplierOpen] = useState(false);
  const [issueFormOpen, setIssueFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [editingIssue, setEditingIssue] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const loadSuppliers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/suppliers`);
      setSuppliers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSuppliers([]);
    }
  }, []);

  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/purchase-issues`, {
        params: {
          q: q || undefined,
          status: statusFilter || undefined,
          supplier_id: supplierFilter || undefined,
          issue_type: issueTypeFilter || undefined,
        },
      });
      setIssues(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load issues");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, [q, statusFilter, supplierFilter, issueTypeFilter]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);
  
  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const summary = useMemo(() => {
    const total = issues.length;

    const open = issues.filter(
      (r) => String(r.status || "").toUpperCase() === "OPEN"
    ).length;

    const pending = issues.filter((r) =>
      [
        "SUPPLIER_CONTACTED",
        "PENDING_REPLACEMENT",
        "PENDING BILL CHANGE",
        "PENDING_CREDIT_NOTE",
      ].includes(String(r.status || "").toUpperCase())
    ).length;

    const closed = issues.filter(
      (r) => String(r.status || "").toUpperCase() === "CLOSED"
    ).length;

    return { total, open, pending, closed };
  }, [issues]);

  const openAdd = () => {
    setEditingIssue(null);
    setIssueFormOpen(true);
  };

  const openEdit = (row) => {
    setEditingIssue(row);
    setIssueFormOpen(true);
  };

  const openDetail = (row) => {
    setSelectedIssue(row);
    setDetailOpen(true);
  };

  const onDelete = async (row) => {
    if (!window.confirm(`Delete issue for "${row.product_name}"?`)) return;
    await axios.delete(`${API}/api/purchase-issues/${row.issue_id}`);
    loadIssues();
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-3">

      {/* TITLE */}
      <div className=" gap-4 items-center mb-4">

  {/* Title */}
        <div className="text-sm font-semibold text-blue-900">
            Purchase Issue Tracker
        </div>

        {/* Status cards */}
        <div className="flex items-center gap-2">

            {/* <div className="flex items-center gap-1 rounded bg-blue-700 px-2 py-1 text-white">
            <span className="text-[10px] uppercase">Total</span>
            <span className="text-[10px] font-semibold">{summary.total}</span>
            </div> */}

            <div className="flex items-center gap-1 rounded border border-gray-200 bg-white px-1 py-0.5 text-gray-500">
            <span className="text-[11px]">Pending Item</span>
            <span className="text-[12px] font-semibold">{summary.pending}</span>
            </div>

            {/* <div className="flex items-center gap-1 rounded bg-red-500 px-2 py-1 text-white">
            <span className="text-[10px] uppercase">Closed</span>
            <span className="text-[10px] font-semibold">{summary.closed}</span>
            </div> */}

        </div>

        </div>

        {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
            </div>
            )}
      {/* FILTER BAR */}
      <div className="rounded-md border bg-white px-3 py-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto_auto_auto]">

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">
              Purchase No
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-8 w-full rounded border border-gray-300 px-2 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">
              Supplier
            </label>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="h-8 w-full rounded border border-gray-300 px-2 text-xs"
            >
              <option value="">All</option>
              {suppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {toTitleCase(s.supplier_name)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 w-full rounded border border-gray-300 px-2 text-xs"
            >
              <option value="">All</option>
              {statusOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">
              Issue Type
            </label>
            <select
              value={issueTypeFilter}
              onChange={(e) => setIssueTypeFilter(e.target.value)}
              className="h-8 w-full rounded border border-gray-300 px-2 text-xs"
            >
              <option value="">All</option>
              {issueTypeOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={loadIssues}
            className="h-8 rounded bg-blue-700 px-4 text-xs font-semibold text-white"
          >
            Search
          </button>

          <button
            onClick={() => setSupplierOpen(true)}
            className="h-8 rounded border px-4 text-xs"
          >
            Suppliers
          </button>

          <button
            onClick={openAdd}
            className="h-8 rounded bg-lime-600 px-4 text-xs font-semibold text-white"
          >
            + New
          </button>
        </div>
      </div>


      {/* TABLE */}
      <div className="mt-6 rounded-md border bg-white shadow-sm">

        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">

            <div className="grid grid-cols-8 bg-blue-700 px-3 py-2 text-[11px] font-semibold text-white">
              <div>Purchase</div>
              <div>Supplier</div>
              <div>Invoice</div>
              <div>Product</div>
              <div>Issue</div>
              <div>Qty</div>
              <div>Status</div>
              <div className="text-center">Action</div>
            </div>

            {loading ? (
                <div className="px-3 py-4 text-sm text-gray-500">Loading....</div>
            ) : issues === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500">No Issues</div>
            ) :
                issues.map((row) => (
              <div
                key={row.issue_id}
                className="grid grid-cols-8 items-center border-t px-3 py-2 text-[11px] hover:bg-gray-50"
              >
                <div>{row.purchase_number}</div>
                <div>{toTitleCase(row.supplier_name)}</div>
                <div>{row.invoice_number}</div>
                <div>{toTitleCase(row.product_name)}</div>
                <div>{row.issue_type}</div>
                <div>{row.quantity}</div>

                <div>
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-green-700">
                    {row.status}
                  </span>
                </div>

                <div className="flex justify-center gap-1">

                  <button
                    onClick={() => openDetail(row)}
                    className="rounded bg-blue-600 px-2 py-1 text-[10px] text-white"
                  >
                    View
                  </button>

                  <button
                    onClick={() => openEdit(row)}
                    className="rounded border px-2 py-1 text-[10px]"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(row)}
                    className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-700"
                  >
                    Delete
                  </button>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PurchaseIssueFormModal
        open={issueFormOpen}
        onClose={() => setIssueFormOpen(false)}
        onSaved={loadIssues}
        editing={editingIssue}
        suppliers={suppliers}
      />

      <PurchaseIssueDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        issue={selectedIssue}
        onUpdated={loadIssues}
      />

      <SupplierModal
        open={supplierOpen}
        onClose={() => setSupplierOpen(false)}
        onRefresh={loadSuppliers}
      />

    </div>
  );
};

export default PurchaseIssuePage;