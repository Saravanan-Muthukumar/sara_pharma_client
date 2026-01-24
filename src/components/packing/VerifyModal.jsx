import { STATUS_TEXT } from "./packingUtils";

const VerifyModal = ({
  open,
  invoice,
  verifierName,
  setVerifierName,
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
            <h2 className="text-sm font-semibold text-gray-900">{STATUS_TEXT.TAKING_DONE}</h2>
            <p className="mt-1 text-xs text-gray-500">
              Invoice: <span className="font-semibold">{invoice?.invoice_number || "-"}</span>
            </p>
          </div>
          <button
            onClick={() => !saving && onClose()}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-3">
          <label className="text-xs font-semibold text-gray-700">Verifier name *</label>
          <input
            value={verifierName}
            onChange={(e) => setVerifierName(e.target.value)}
            placeholder="Enter verifier name"
            className="mt-2 h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
          />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex-1 rounded-md bg-teal-600 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Confirm"}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-md border py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyModal;
