import { useEffect, useMemo, useState } from "react";
import {
  STATUS_TEXT,
  actionBtnClass,
  fmtTime,
  durationPartsHMS,
  toTitleCase,
  formatINR,
} from "./packingUtils";

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


const InvoiceCard = ({
  it,
  mode, // "MY_JOB" | "TO_TAKE" | "TO_VERIFY" | "ALL"
  currentUsername,
  onStartTaking,
  onMarkTaken,
  onStartVerify,
  onMarkPacked,
  disableActions,
}) => {
  const status = String(it.status || "").trim();

  const invoiceNo = String(it.invoice_number || "-").trim();
  const customer = toTitleCase(it.customer_name);
  const courier = String(it.courier_name || "-").trim() || "-";
  const valueText = formatINR(it.invoice_value);

  const takenByRaw = String(it.taken_by || "").trim();
  const packedByRaw = String(it.packed_by || "").trim();


  const isTaking = status === "TAKING";
  const isVerifying = status === "VERIFYING";
  const isInProgress = isTaking || isVerifying;

  const startTs = useMemo(() => {
    if (isTaking) return it.take_started_at || it.updated_at || it.created_at;
    if (isVerifying) return it.verify_started_at || it.updated_at || it.created_at;
    return it.updated_at || it.created_at;
  }, [isTaking, isVerifying, it.take_started_at, it.verify_started_at, it.updated_at, it.created_at]);

  const completionTs = useMemo(() => {
    if (status === "TO_VERIFY") return it.take_completed_at || it.updated_at || it.created_at;
    if (status === "PACKED") return it.pack_completed_at || it.updated_at || it.created_at;
    return it.updated_at || it.created_at;
  }, [status, it.take_completed_at, it.pack_completed_at, it.updated_at, it.created_at]);

  const timeNode = isInProgress ? (
    mode === "ALL" ? <RunningDurationHMS startTs={startTs} /> : <RunningDurationHMS startTs={startTs} />
  ) : (
    <span>{fmtTime(completionTs)}</span>
  );

  let actionBtn = null;

  if (!disableActions) {
    if (mode === "TO_TAKE" && status === "TO_TAKE") {
      actionBtn = (
        <button
          type="button"
          onClick={() => onStartTaking(it.invoice_id)}
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
          onClick={() => onMarkTaken(it.invoice_id)}
          className={actionBtnClass("TAKEN")}
        >
          Mark Taken
        </button>
      );
    }

    if (mode === "TO_VERIFY" && status === "TO_VERIFY") {
      const notAllowed = takenByRaw && takenByRaw === String(currentUsername || "").trim();
      actionBtn = (
        <button
          type="button"
          onClick={() => !notAllowed && onStartVerify(it.invoice_id)}
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

    if (mode === "MY_JOB" && status === "VERIFYING") {
      actionBtn = (
        <button
          type="button"
          onClick={() => onMarkPacked(it.invoice_id)}
          className={actionBtnClass("PACKED")}
        >
          Mark Packed
        </button>
      );
    }
  }

  let nameNode = null;

  if (status === "TAKING" || status === "TO_VERIFY") {
    nameNode = (
      <span className="truncate">
         {takenByRaw}
      </span>
    );
  }
  
  if (status === "VERIFYING") {
    nameNode = (
      <span className="truncate">
         {packedByRaw}
      </span>
    );
  }
  
  if (status === "PACKED") {
    nameNode = (
        <div div className= "flex gap-6">
                  <span className="truncate">
        Taken by {takenByRaw}  
      </span>
      <span className="truncate">
        Packed by {packedByRaw}
      </span>
        </div>

      
    );
  }

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
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
          {STATUS_TEXT[status] || status}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-w-0 flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span>Qty: {it.no_of_products}</span>
          <span className="text-gray-300">•</span>
          <span>{valueText}</span>
          <span className="text-gray-300">•</span>
          <span className="truncate">{courier}</span>
          <span className="text-gray-300">•</span>
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

export default InvoiceCard;
