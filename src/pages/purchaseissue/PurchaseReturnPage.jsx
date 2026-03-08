import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { API, toTitleCase } from "../../components/packing/packingUtils";
import SupplierModal from "../../components/purchaseissue/SupplierModal";
import PurchaseReturnFormModal from "../../components/purchaseissue/PurchaseReturnFormModal";

const statusOptions = [
  "STOCK_SENT_IN_COURIER",
  "STOCK_RETURNED_TO_SALESMAN",
  "STOCK_RECEIVED_BY_SUPPLIER",
  "PURCHASE_RETURN_RECEIVED",
];

const tableCols =
  "grid-cols-[0.95fr_1fr_1.25fr_0.8fr_0.95fr_0.95fr_0.7fr_1.45fr_.35fr]";

const PurchaseReturnPage = () => {
  const [loading, setLoading] = useState(false);
  const [returns, setReturns] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [supplierOpen, setSupplierOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const menuRef = useRef(null);

  const loadSuppliers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/suppliers`);
      setSuppliers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSuppliers([]);
    }
  }, []);

  const loadReturns = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
  
      const res = await axios.get(`${API}/api/purchase-returns`, {
        params: {
          q: q || undefined,
          status: statusFilter || undefined,
          supplier_id: supplierFilter || undefined,
        },
      });
  
      setReturns(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load purchase returns");
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, [q, statusFilter, supplierFilter]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);


  const summary = useMemo(() => {
    const total = returns.length;

    const inTransit = returns.filter((r) =>
      ["STOCK_SENT_IN_COURIER", "STOCK_RETURNED_TO_SALESMAN"].includes(
        String(r.status || "").toUpperCase()
      )
    ).length;

    const received = returns.filter(
      (r) => String(r.status || "").toUpperCase() === "PURCHASE_RETURN_RECEIVED"
    ).length;

    return { total, inTransit, received };
  }, [returns]);

  const openAdd = () => {
    setEditingRow(null);
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    setFormOpen(true);
    setOpenMenuId(null);
  };

  const onDelete = async (row) => {
    setOpenMenuId(null);

    if (!window.confirm(`Delete purchase return "${row.purchase_return_no}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API}/api/purchase-returns/${row.purchase_return_id}`);
      await loadReturns();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete purchase return");
    }
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "PURCHASE_RETURN_RECEIVED") {
      return "bg-green-50 text-green-700";
    }

    if (normalized === "STOCK_SENT_IN_COURIER") {
      return "bg-blue-50 text-blue-700";
    }

    if (normalized === "STOCK_RECEIVED_BY_SUPPLIER") {
      return "bg-purple-50 text-purple-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-3">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-blue-900">
            Purchase Return Tracker
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-0.5 text-gray-500">
              <span className="text-[11px]">Total Return</span>
              <span className="text-[12px] font-semibold">{summary.total}</span>
            </div>

            <div className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-0.5 text-gray-500">
              <span className="text-[11px]">In Transit</span>
              <span className="text-[12px] font-semibold">{summary.inTransit}</span>
            </div>

            <div className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-0.5 text-gray-500">
              <span className="text-[11px]">Received</span>
              <span className="text-[12px] font-semibold">{summary.received}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSupplierOpen(true)}
            className="h-8 rounded border bg-white px-4 text-xs"
          >
            Suppliers
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="h-8 rounded bg-lime-600 px-4 text-xs font-semibold text-white"
          >
            + New
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-md bg-white shadow-sm">
        <div className="overflow-visible">
          <div className={`grid ${tableCols} items-center gap-3 px-3 py-4`}>
            <div className="flex justify-center">
              <div className="flex h-9 w-full items-center gap-2 rounded-md bg-white px-3 text-[11px] text-gray-700 ring-1 ring-gray-300">
                <Search size={14} className="shrink-0 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="All Return No"
                  className="w-full bg-transparent outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex h-9 w-full items-center justify-center rounded-md bg-white px-3 text-[11px] text-gray-500 ring-1 ring-gray-300">
                All Dates
              </div>
            </div>

            <div className="flex flex-col items-center">
  
                {/* Dropdown left aligned */}
                <select
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                    className="h-9 w-full rounded-md bg-white px-3 text-left text-[11px] text-gray-700 outline-none ring-1 ring-gray-300"
                >
                    <option value="">All Suppliers</option>
                    {suppliers.map((s) => (
                    <option key={s.supplier_id} value={s.supplier_id}>
                        {toTitleCase(s.supplier_name)}
                    </option>
                    ))}
                </select>

                </div>

            <div className="flex justify-center">
              <div className="flex h-9 w-full items-center justify-center rounded-md bg-white px-3 text-[11px] text-gray-500 ring-1 ring-gray-300">
                Return Amount
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex h-9 w-full items-center justify-center rounded-md bg-white px-3 text-[11px] text-gray-500 ring-1 ring-gray-300">
                Supplier Return No
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex h-9 w-full items-center justify-center rounded-md bg-white px-3 text-[11px] text-gray-500 ring-1 ring-gray-300">
                Supplier Amount
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex h-9 w-full items-center justify-center rounded-md bg-white px-3 text-[11px] text-gray-500 ring-1 ring-gray-300">
                Diff
              </div>
            </div>

            <div className="flex justify-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 w-full rounded-md bg-white px-3 text-left text-[11px] text-gray-700 outline-none ring-1 ring-gray-300"
              >
                <option value="">All Status</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div />
          </div>

          <div className="border rounded border-gray-200">

          {loading ? (
            <div className="px-3 py-4 text-sm text-gray-500">Loading....</div>
          ) : returns.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-500">No purchase returns</div>
          ) : (
            [...returns]
            .sort((a, b) =>
            String(b.purchase_return_no || "").localeCompare(
                String(a.purchase_return_no || ""),
                undefined,
                { numeric: true }
            )
            )
            .map((row) => {
              const diff =
                Number(row.purchase_return_amount || 0) -
                Number(row.supplier_sales_return_amount || 0);

              return (
                <div
                  key={row.purchase_return_id}
                  className={`grid ${tableCols} items-center gap-1 border-t px-3 py-0.5 text-[11px] hover:bg-gray-50`}
                >
                  <div className="text-center">{row.purchase_return_no}</div>

                  <div className="text-center">
                    {row.purchase_return_date
                      ? String(row.purchase_return_date).slice(0, 10)
                      : ""}
                  </div>

                  <div className="text-center">{toTitleCase(row.supplier_name)}</div>

                  <div className="text-center">{row.purchase_return_amount}</div>

                  <div className="text-center">{row.supplier_sales_return_no || "-"}</div>

                  <div className="text-center">
                    {row.supplier_sales_return_amount ?? "-"}
                  </div>

                  <div
                    className={`text-center ${
                      diff !== 0 ? "font-semibold text-red-600" : ""
                    }`}
                  >
                    {diff}
                  </div>

                  <div className="flex items-center justify-center">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] whitespace-nowrap ${getStatusClass(
                        row.status
                      )}`}
                    >
                      {row.status}
                    </span>
                  </div>

                  <div
                    className="relative flex justify-center"
                    ref={openMenuId === row.purchase_return_id ? menuRef : null}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId((prev) =>
                          prev === row.purchase_return_id ? null : row.purchase_return_id
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-gray-600 hover:bg-gray-100"
                    >
                      ⋯
                    </button>

                    {openMenuId === row.purchase_return_id && (
                      <div className="absolute right-0 top-9 z-50 min-w-[120px] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="block w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      </div>

      <PurchaseReturnFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingRow(null);
        }}
        onSaved={loadReturns}
        editing={editingRow}
        suppliers={suppliers}
      />

      <SupplierModal
        open={supplierOpen}
        onClose={() => setSupplierOpen(false)}
        onRefresh={loadSuppliers}
      />
    </div>
  );
};

export default PurchaseReturnPage;