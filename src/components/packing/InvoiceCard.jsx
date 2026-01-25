// src/components/packing/InvoiceCard.jsx
import { useEffect, useState, useMemo } from "react";
import {
  STATUS_TEXT,
  actionBtnClass,
  fmtTime,
  durationPartsHMS,
  durationPartsHM,
  formatInvoiceNumber,
  toTitleCase,
  formatINR,
} from "./packingUtils";

/* Running durations */
const RunningDurationHMS = ({ startTs }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const { hh, mm, ss } = durationPartsHMS(startTs, now);
  return (
    <span>
      {hh}:{mm}:{ss}
    </span>
  );
};

const RunningDurationHM = ({ startTs }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const { hh, mm } = durationPartsHM(startTs, now);
  return (
    <span>
      {hh}:{mm}
    </span>
  );
};

const InvoiceCard = ({
  it,
  activeFilter,
  onEdit,
  onMarkTaken,
  onOpenVerify,
  onMarkPacked,
  isAdmin,
  currentUsername,
}) => {
  const isAllTab = activeFilter === "ALL";

  const isTaking = it.status === "TAKING_IN_PROGRESS";
  const isToVerify = it.status === "TAKING_DONE";
  const isVerifying = it.status === "VERIFY_IN_PROGRESS";

  const isInProgress = isTaking || isVerifying;

  const showSeconds =
    !isAllTab &&
    (activeFilter === "TAKING_IN_PROGRESS" || activeFilter === "VERIFY_IN_PROGRESS");

  const invoiceNo = formatInvoiceNumber(it.invoice_number);
  const customer = toTitleCase(it.customer_name);
  const courier = String(it.courier_name || "-").trim() || "-";
  const valueText = formatINR(it.invoice_value);

  const takenByRaw = String(it.taken_by || "").trim();
  const packedByRaw = String(it.packed_by || "").trim();
  const takenBy = toTitleCase(takenByRaw || "-");
  const packedBy = toTitleCase(packedByRaw || "-");

  // Timers: taking uses take_started_at; verifying uses verify_started_at
  const startTs = useMemo(() => {
    if (isTaking) return it.take_started_at || it.created_at || it.updated_at;
    if (isVerifying) return it.verify_started_at || it.updated_at || it.created_at;
    return it.updated_at || it.created_at;
  }, [isTaking, isVerifying, it.take_started_at, it.verify_started_at, it.created_at, it.updated_at]);

  const completionTs = useMemo(() => {
    if (it.status === "TAKING_DONE") return it.take_completed_at || it.updated_at || it.created_at;
    if (it.status === "COMPLETED") return it.pack_completed_at || it.updated_at || it.created_at;
    return it.updated_at || it.created_at;
  }, [it.status, it.take_completed_at, it.pack_completed_at, it.updated_at, it.created_at]);

  const timeNode = isInProgress ? (
    showSeconds ? <RunningDurationHMS startTs={startTs} /> : <RunningDurationHM startTs={startTs} />
  ) : (
    <span>{fmtTime(completionTs)}</span>
  );

  // Permissions (as per your final rules)
  const canMarkTaken = isAdmin || (takenByRaw && takenByRaw === String(currentUsername || "").trim());
  // "To Verify" disabled ONLY if login user is taken_by (enabled for others + admin)
  const canToVerify = isAdmin || !(takenByRaw && takenByRaw === String(currentUsername || "").trim());
  const canMarkPacked =
    isAdmin || (packedByRaw && packedByRaw === String(currentUsername || "").trim());

  let actionBtn = null;

  if (!isAllTab) {
    if (isTaking) {
      actionBtn = (
        <button
          type="button"
          onClick={() => canMarkTaken && onMarkTaken(it.invoice_id)}
          disabled={!canMarkTaken}
          className={[
            `${actionBtnClass("TAKEN")} !min-w-0 px-2`,
            !canMarkTaken ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
          title={!canMarkTaken ? "Only assigned staff or admin can mark taken" : ""}
        >
          Mark Taken
        </button>
      );
    } else if (isToVerify) {
      actionBtn = (
        <button
          type="button"
          onClick={() => canToVerify && onOpenVerify(it)}
          disabled={!canToVerify}
          className={[
            `${actionBtnClass("VERIFY")} !min-w-0 px-2`,
            !canToVerify ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
          title={!canToVerify ? "Taken staff cannot move to Verify (only others/admin)" : ""}
        >
          To Verify
        </button>
      );
    } else if (isVerifying) {
      actionBtn = (
        <button
          type="button"
          onClick={() => canMarkPacked && onMarkPacked(it.invoice_id)}
          disabled={!canMarkPacked}
          className={[
            `${actionBtnClass("PACKED")} !min-w-0 px-2`,
            !canMarkPacked ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
          title={!canMarkPacked ? "Only packed-by staff or admin can mark packed" : ""}
        >
          Mark Packed
        </button>
      );
    }
  }

  // Name display rules:
  // - Taking + To Verify: show taken_by
  // - Verifying + Packed: show packed_by (as requested)
  const nameLabel = isTaking || isToVerify ? "Staff" : "Packed By";
  const nameValue = isTaking || isToVerify ? takenBy : packedBy;

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      {/* LINE 1 */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-semibold text-gray-900 shrink-0">{invoiceNo}</span>
        <span className="font-semibold text-gray-900 truncate">{customer}</span>

        <span className="inline-flex items-center gap-1 text-green-700 text-[11px] shrink-0">
          {isInProgress && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
            </span>
          )}
          {STATUS_TEXT[it.status] || it.status}
        </span>
      </div>

      {/* LINE 2 */}
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-w-0 flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span>Qty: {it.no_of_products}</span>
          <span className="text-gray-300">•</span>

          <span>{valueText}</span>
          <span className="text-gray-300">•</span>

          <span className="truncate">{courier}</span>
          <span className="text-gray-300">•</span>

          <span className="truncate">
            {nameLabel}: {nameValue}
          </span>
          <span className="text-gray-300">•</span>

          <span>{timeNode}</span>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {isAllTab && (
            <button
              type="button"
              onClick={() => onEdit(it)}
              className="h-8 rounded-md border px-2 text-[11px] hover:bg-gray-50"
            >
              Edit
            </button>
          )}
          {!isAllTab && actionBtn}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
