import { useEffect, useState } from "react";
import {
  STATUS_TEXT,
  statusChipClass,
  actionBtnClass,
  fmtTime,
  durationPartsHMS,
  durationPartsHM,
} from "./packingUtils";

/** Running duration HH:MM:SS (updates every second) */
const RunningDurationHMS = ({ startTs }) => {
//   const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // ✅ compute directly (no useMemo => no eslint dependency warnings)
  const { hh, mm, ss } = durationPartsHMS(startTs);

  return <span className="text-gray-700">{hh}:{mm}:{ss}</span>;
};

/** Running duration HH:MM (updates every minute) */
const RunningDurationHM = ({ startTs }) => {
//   const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const { hh, mm } = durationPartsHM(startTs);

  return <span className="text-gray-700">{hh}:{mm}</span>;
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

  const showVal =
    it.invoice_value !== null &&
    it.invoice_value !== undefined &&
    String(it.invoice_value) !== "";

  const canMarkTaken = it.status === "TAKING_IN_PROGRESS";
  const canToVerify = it.status === "TAKING_DONE";
  const canMarkPacked = it.status === "VERIFY_IN_PROGRESS";

  const ts = it.updated_at || it.created_at;

  const isInProgressStatus =
    it.status === "TAKING_IN_PROGRESS" || it.status === "VERIFY_IN_PROGRESS";

  // ✅ seconds only in in-progress tabs (not ALL)
  const showSeconds =
    !isAllTab &&
    (activeFilter === "TAKING_IN_PROGRESS" || activeFilter === "VERIFY_IN_PROGRESS");

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
        {/* Left */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-gray-900 shrink-0">{it.invoice_number}</span>
            <span className="text-gray-600 truncate">{it.customer_name}</span>
          </div>

          <div className="mt-2 min-w-0 text-sm text-gray-700 flex items-center gap-2 flex-wrap">
            <span className="truncate">{it.courier_name}</span>
            <span className="text-gray-300">•</span>
            <span>Qty: {it.no_of_products}</span>
            <span className="text-gray-300">•</span>
            <span className="truncate">{it.staff_name}</span>

            {showVal && (
              <>
                <span className="text-gray-300">•</span>
                <span>Val: {it.invoice_value}</span>
              </>
            )}

            <span className="text-gray-300">•</span>

            {/* In progress: duration | Completed: only time */}
            {isInProgressStatus ? (
              showSeconds ? (
                <RunningDurationHMS startTs={ts} />
              ) : (
                <RunningDurationHM startTs={ts} />
              )
            ) : (
              <span>{fmtTime(ts)}</span>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="shrink-0 flex flex-col items-stretch gap-2 w-[140px]">
          {isAllTab && (
            <button
              onClick={() => onEdit(it)}
              className="h-9 rounded-md border px-3 text-xs text-gray-800 hover:bg-gray-50"
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
