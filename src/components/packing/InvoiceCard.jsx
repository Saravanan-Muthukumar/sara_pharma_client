import { useEffect, useState } from "react";
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

/* ======================
   Running Durations
====================== */

const RunningDurationHMS = ({ startTs }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { hh, mm, ss } = durationPartsHMS(startTs, now);
  return <span>{hh}:{mm}:{ss}</span>;
};

const RunningDurationHM = ({ startTs }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const { hh, mm } = durationPartsHM(startTs, now);
  return <span>{hh}:{mm}</span>;
};

/* ======================
   Invoice Card
====================== */

const InvoiceCard = ({
  it,
  activeFilter,
  onEdit,
  onMarkTaken,
  onOpenVerify,
  onMarkPacked,
}) => {
  const isAllTab = activeFilter === "ALL";

  const isTaking = it.status === "TAKING_IN_PROGRESS";
  const isToVerify = it.status === "TAKING_DONE";
  const isVerifying = it.status === "VERIFY_IN_PROGRESS";

  const isInProgress = isTaking || isVerifying;

  const showSeconds =
    !isAllTab &&
    (activeFilter === "TAKING_IN_PROGRESS" ||
      activeFilter === "VERIFY_IN_PROGRESS");

  const ts = it.updated_at || it.created_at;

  /* ---------- formatted values ---------- */
  const invoiceNo = formatInvoiceNumber(it.invoice_number);
  const customer = toTitleCase(it.customer_name);
  const staff = toTitleCase(it.staff_name);
  const courier = String(it.courier_name || "-").trim() || "-";
  const valueText = formatINR(it.invoice_value);

  const timeNode = isInProgress ? (
    showSeconds ? (
      <RunningDurationHMS startTs={ts} />
    ) : (
      <RunningDurationHM startTs={ts} />
    )
  ) : (
    <span>{fmtTime(ts)}</span>
  );

  /* ---------- action ---------- */
  let actionBtn = null;

  if (!isAllTab) {
    if (isTaking) {
      actionBtn = (
        <button
          onClick={() => onMarkTaken(it.invoice_id)}
          className={actionBtnClass("TAKEN")}
        >
          Mark Taken
        </button>
      );
    } else if (isToVerify) {
      actionBtn = (
        <button
          onClick={() => onOpenVerify(it)}
          className={actionBtnClass("VERIFY")}
        >
          To Verify
        </button>
      );
    } else if (isVerifying) {
      actionBtn = (
        <button
          onClick={() => onMarkPacked(it.invoice_id)}
          className={actionBtnClass("PACKED")}
        >
          Mark Packed
        </button>
      );
    }
  }

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        {/* LEFT */}
        <div className="min-w-0">
          {/* Primary line */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-gray-900 shrink-0">
              {invoiceNo}
            </span>

            <span className="font-semibold text-gray-900 truncate">
              {customer}
            </span>

            {/* Status text (green, no background) */}
            <span className="inline-flex items-center gap-1 text-green-700 text-[11px]">
              {isInProgress && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
                </span>
              )}
              {STATUS_TEXT[it.status] || it.status}
            </span>
          </div>

          {/* Secondary metadata */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span>Qty: {it.no_of_products}</span>
            <span className="text-gray-300">•</span>

            <span>{valueText}</span>
            <span className="text-gray-300">•</span>

            <span className="truncate">{courier}</span>
            <span className="text-gray-300">•</span>

            <span className="truncate">{staff}</span>
            <span className="text-gray-300">•</span>

            <span>{timeNode}</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="shrink-0 flex flex-col gap-2 w-[110px]">
          {isAllTab && (
            <button
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
