// src/components/packing/VerifyModal.jsx
const VerifyModal = ({
    open,
    invoice,
    isAdmin,
    staffName,
    setStaffName,
    error,
    onClose,
    onConfirm,
    saving,
  }) => {
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
        <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Move to Verifying</h2>
              <p className="mt-1 text-xs text-gray-500">
                Invoice: <span className="font-semibold">{invoice?.invoice_number || "-"}</span>
              </p>
            </div>
  
            <button
              type="button"
              onClick={() => !saving && onClose()}
              className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
  
          <div className="mt-3">
            <label className="text-xs font-semibold text-gray-700">
              Staff name (Packed By) *
            </label>
  
            <input
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              disabled={!isAdmin} // only admin can edit
              className={[
                "mt-2 h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600",
                !isAdmin ? "bg-gray-100 cursor-not-allowed" : "bg-white",
              ].join(" ")}
              placeholder="Enter staff name"
            />
  
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>
  
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={saving}
              className="flex-1 rounded-md bg-teal-600 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Confirm"}
            </button>
  
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-md border py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
  
          {!isAdmin && (
            <p className="mt-3 text-[11px] text-gray-500">
              Only admin can change the name here. Your login name is used automatically.
            </p>
          )}
        </div>
      </div>
    );
  };
  
  export default VerifyModal;
  