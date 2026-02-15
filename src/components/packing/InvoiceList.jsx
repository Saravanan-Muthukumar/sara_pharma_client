// src/components/packing/InvoiceList.jsx
import { useEffect, useMemo, useState } from "react";
import MarkPackedBoxModal from "./MarkPackedBoxModal";
import {
  STATUS_TEXT,
  actionBtnClass,
  fmtTime,
  durationPartsHMS,
  toTitleCase,
  formatINR,
} from "./packingUtils";

/* =========================
   Running Duration
========================= */
const RunningDurationHMS = ({ startTs }) => {
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { hh, mm, ss } = durationPartsHMS(startTs, nowMs);

  return (
    <span>
      {hh}:{mm}:{ss}
    </span>
  );
};

/* =========================
   Invoice Card (internal)
========================= */
const InvoiceCard = ({
  invoice_row,
  mode,
  currentUsername,
  actions,
  disableActions,
  onOpenMarkPackedModal, // ✅ NEW
}) => {
  const status = String(invoice_row.status || "").trim();

  const invoiceNo = String(invoice_row.invoice_number || "-").trim();
  const customerName = toTitleCase(invoice_row.customer_name);
  const courierName = String(invoice_row.courier_name || "-").trim() || "-";
  const invoiceValueText = formatINR(invoice_row.invoice_value);

  const takenBy = String(invoice_row.taken_by || "").trim();
  const packedBy = String(invoice_row.packed_by || "").trim();

  const isTaking = status === "TAKING";
  const isVerifying = status === "VERIFYING";
  const isInProgress = isTaking || isVerifying;

  const startTs = useMemo(() => {
    if (isTaking) return invoice_row.take_started_at || invoice_row.updated_at || invoice_row.created_at;
    if (isVerifying) return invoice_row.verify_started_at || invoice_row.updated_at || invoice_row.created_at;
    return invoice_row.updated_at || invoice_row.created_at;
  }, [
    isTaking,
    isVerifying,
    invoice_row.take_started_at,
    invoice_row.verify_started_at,
    invoice_row.updated_at,
    invoice_row.created_at,
  ]);

  const completionTs = useMemo(() => {
    if (status === "TO_VERIFY") return invoice_row.take_completed_at || invoice_row.updated_at || invoice_row.created_at;
    if (status === "PACKED") return invoice_row.pack_completed_at || invoice_row.updated_at || invoice_row.created_at;
    return invoice_row.updated_at || invoice_row.created_at;
  }, [
    status,
    invoice_row.take_completed_at,
    invoice_row.pack_completed_at,
    invoice_row.updated_at,
    invoice_row.created_at,
  ]);

  const timeNode = isInProgress ? (
    <RunningDurationHMS startTs={startTs} />
  ) : (
    <span>{fmtTime(completionTs)}</span>
  );

  // Action button
  let actionBtn = null;

  if (!disableActions) {
    if (mode === "TO_TAKE" && status === "TO_TAKE") {
      actionBtn = (
        <button
          type="button"
          onClick={() => actions?.startTaking?.(invoice_row.invoice_id)}
          className={actionBtnClass("START")}
        >
          Start Taking
        </button>
      );
    }

    if (mode === "MY_JOB" && status === "TAKING") {
      actionBtn = (
        <button
          type="button"
          onClick={() => actions?.markTaken?.(invoice_row.invoice_id)}
          className={actionBtnClass("TAKEN")}
        >
          Mark Taken
        </button>
      );
    }

    if (mode === "TO_VERIFY" && status === "TO_VERIFY") {
      const notAllowed = takenBy && takenBy === String(currentUsername || "").trim();
      actionBtn = (
        <button
          type="button"
          onClick={() => !notAllowed && actions?.startVerify?.(invoice_row.invoice_id)}
          disabled={notAllowed}
          className={[
            actionBtnClass("VERIFY"),
            notAllowed ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
          title={notAllowed ? "You cannot verify/pack an invoice you took" : ""}
        >
          Start Verify
        </button>
      );
    }

    // ✅ Mark Packed opens modal (NOT direct API call)
    if (mode === "MY_JOB" && status === "VERIFYING") {
      actionBtn = (
        <button
          type="button"
          onClick={() => onOpenMarkPackedModal(invoice_row.invoice_id)}
          className={actionBtnClass("PACKED")}
        >
          Mark Packed
        </button>
      );
    }
  }

  // Name node
  let nameNode = null;

  if (status === "TAKING" || status === "TO_VERIFY") {
    nameNode = <span className="truncate">{takenBy}</span>;
  }

  if (status === "VERIFYING") {
    nameNode = <span className="truncate">{packedBy}</span>;
  }

  if (status === "PACKED") {
    nameNode = (
      <div className="flex gap-6">
        <span className="truncate">Taken by {takenBy}</span>
        <span className="truncate">Packed by {packedBy}</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-semibold text-gray-900 shrink-0">{invoiceNo}</span>
        <span className="font-semibold text-gray-900 truncate">{customerName}</span>

        <span className="inline-flex items-center gap-1 text-green-700 text-[11px] shrink-0">
          {isInProgress && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
            </span>
          )}
          {STATUS_TEXT[status] || status}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-w-0 flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span>Qty: {invoice_row.no_of_products}</span>
          <span className="text-gray-300">•</span>
          <span>{invoiceValueText}</span>
          <span className="text-gray-300">•</span>
          <span className="truncate">{courierName}</span>

          {nameNode && (
            <>
              <span className="text-gray-300">•</span>
              {nameNode}
            </>
          )}

          <span className="text-gray-300">•</span>
          <span>{timeNode}</span>
        </div>

        <div className="shrink-0">{actionBtn}</div>
      </div>
    </div>
  );
};

/* =========================
   Invoice List (export)
========================= */
const InvoiceList = ({
  list = [],
  mode,
  loading,
  emptyText = "No bills",
  currentUsername,
  disableActions = false,
  disableVerifyStartForRow,
  actions,
  onRefresh, // ✅ NEW (pass refresh from parent)
}) => {
  const [openPackedModal, setOpenPackedModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const open_mark_packed_modal = (invoice_id) => {
    setSelectedInvoiceId(invoice_id);
    setOpenPackedModal(true);
  };

  if (!loading && (!list || list.length === 0)) {
    return <div className="rounded-md border bg-white p-3 text-xs text-gray-500">{emptyText}</div>;
  }

  return (
    <>
      <div className="space-y-3">
        {(list || []).map((invoice_row) => {
          const rowDisable =
            typeof disableVerifyStartForRow === "function"
              ? disableVerifyStartForRow(invoice_row) || disableActions
              : disableActions;

          return (
            <InvoiceCard
              key={invoice_row.invoice_id}
              invoice_row={invoice_row}
              mode={mode}
              currentUsername={currentUsername}
              actions={actions}
              disableActions={rowDisable}
              onOpenMarkPackedModal={open_mark_packed_modal} // ✅
            />
          );
        })}
      </div>

      {/* ✅ Modal only once */}
      <MarkPackedBoxModal
        open={openPackedModal}
        onClose={() => setOpenPackedModal(false)}
        invoice_id={selectedInvoiceId}
        username={currentUsername}
        onSaved={onRefresh}
      />
    </>
  );
};

export default InvoiceList;
