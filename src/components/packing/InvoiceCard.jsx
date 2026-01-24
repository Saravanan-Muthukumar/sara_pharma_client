import { useEffect, useState } from "react";
import {
  STATUS_TEXT,
  statusChipClass,
  actionBtnClass,
  fmtTime,
  durationPartsHMS,
  durationPartsHM,
  formatInvoiceNumber,
  toTitleCase,
  formatINR,
} from "./packingUtils";

/** Running duration HH:MM:SS (updates every second) */
const RunningDurationHMS = ({ startTs }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { hh, mm, ss } = durationPartsHMS(startTs, now);
  return <span>{hh}:{mm}:{ss}</span>;
};

/** Running duration HH:MM (updates every minute) */
const RunningDurationHM = ({ startTs }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const { hh, mm } = durationPartsHM(startTs, now);
  return <span>{hh}:{mm}</span>;
};

const InvoiceCard = ({
  it,
  onEdit,
  onMarkTaken,
  onOpenVerify,
  onMarkPacked,
  activeFilter,
}) => {
  const isAllTab = activeFilter === "ALL";

  const canMarkTaken = it.status === "TAKING_IN_PROGRESS";
  const canToVerify = it.status === "TAKING_DONE";
  const canMarkPacked = it.status === "VERIFY_IN_PROGRESS";

  const ts = it.updated_at || it.created_at;

  const isInProgressStatus =
    it.status === "TAKING_IN_PROGRESS" || it.status === "VERIFY_IN_PROGRESS";

  // seconds only in in-progress tabs (not ALL)
  const showSeconds =
    !isAllTab &&
    (activeFilter === "TAKING_IN_PROGRESS" || activeFilter === "VERIFY_IN_PROGRESS");

  const inv = formatInvoiceNumber(it.invoice_number);
  const customer = toTitleCase(it.customer_name);
  const staff = toTitleCase(it.staff_name);
  const courier = String(it.courier_name ?? "").trim() || "-";
  const valueText = formatINR(it.invoice_value);

  const timeText = isInProgressStatus
    ? (showSeconds ? <RunningDurationHMS startTs={ts} /> : <RunningDurationHM startTs={ts} />)
    : <span>{fmtTime(ts)}</span>;

  const actionButton = isAllTab
    ? null
    : canMarkTaken
    ? (
      <button onClick={() => onMarkTaken(it.invoice_id)} className={actionBtnClass("TAKEN")}>
        Mark Taken
      </button>
    )
    : canToVerify
    ? (
      <button onClick={() => onOpenVerify(it)} className={actionBtnClass("VERIFY")}>
        To verify
      </button>
    )
    : canMarkPacked
    ? (
      <button onClick={() => onMarkPacked(it.invoice_id)} className={actionBtnClass("PACKED")}>
        Mark Packed
      </button>
    )
    : null;

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        {/* LEFT */}
        <div className="min-w-0">
          {/* Primary row (only these are primary) */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-gray-900 font-semibold shrink-0">{inv}</span>
            <span className="text-gray-900 font-semibold truncate">{customer}</span>
          </div>

          {/* Secondary metadata (smaller) - exact order: Qty, Value, Courier, Staff, Time */}
          <div className="mt-2 text-xs text-gray-600 flex items-center gap-2 flex-wrap">
            <span>Qty: {it.no_of_products}</span>
            <span className="text-gray-300">•</span>
            <span>{valueText}</span>
            <span className="text-gray-300">•</span>
            <span className="truncate">{courier}</span>
            <span className="text-gray-300">•</span>
            <span className="truncate">{staff}</span>
            <span className="text-gray-300">•</span>
            <span>{timeText}</span>
          </div>
        </div>

        {/* RIGHT (narrow + small) */}
        <div className="shrink-0 flex flex-col items-stretch gap-2 w-[112px]">
          {/* Edit only in ALL tab */}
          {isAllTab && (
            <button
              onClick={() => onEdit(it)}
              className="h-8 rounded-md border px-2 text-[11px] text-gray-800 hover:bg-gray-50"
            >
              Edit
            </button>
          )}

          <span className={statusChipClass()}>
            {STATUS_TEXT[it.status] || it.status}
          </span>

          {!isAllTab && actionButton}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
