import moment from "moment";

export const API = "https://octopus-app-l59s5.ondigitalocean.app";

/** Status text shown inside invoice cards (chip text) */
export const STATUS_TEXT = {
  TAKING_IN_PROGRESS: "Taking now",
  TAKING_DONE: "Take completed",
  VERIFY_IN_PROGRESS: "Verifying now",
  COMPLETED: "Packed",
};

/** Tabs (TAKING_DONE tab heading = To verify) */
export const FILTERS = [
  { key: "TAKING_IN_PROGRESS", label: "Taking now", statuses: ["TAKING_IN_PROGRESS"] },
  { key: "TAKING_DONE", label: "To verify", statuses: ["TAKING_DONE"] },
  { key: "VERIFY_IN_PROGRESS", label: "Verifying now", statuses: ["VERIFY_IN_PROGRESS"] },
  { key: "COMPLETED", label: "Packed", statuses: ["COMPLETED"] },
  { key: "ALL", label: "All", statuses: null },
];

export const isBlank = (v) => v === undefined || v === null || String(v).trim() === "";

/** Time format (only time, no date) */
export const fmtTime = (ts) => (ts ? moment(ts).format("h:mm A") : "-");

/** Duration parts (HH:MM) - used for ALL tab in-progress */
export const durationPartsHM = (startTs, nowMs = Date.now()) => {
  if (!startTs) return { hh: "00", mm: "00" };
  const start = new Date(startTs).getTime();
  const now = nowMs;
  if (!Number.isFinite(start) || now < start) return { hh: "00", mm: "00" };

  const totalMin = Math.floor((now - start) / 60000);
  const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const mm = String(totalMin % 60).padStart(2, "0");
  return { hh, mm };
};

/** Duration parts (HH:MM:SS) - used for in-progress tabs */
export const durationPartsHMS = (startTs, nowMs = Date.now()) => {
  if (!startTs) return { hh: "00", mm: "00", ss: "00" };
  const start = new Date(startTs).getTime();
  const now = nowMs;
  if (!Number.isFinite(start) || now < start) return { hh: "00", mm: "00", ss: "00" };

  const totalSec = Math.floor((now - start) / 1000);
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  return { hh, mm, ss };
};

/** ✅ Invoice prefix rule A:
 * - if starts with SA0 => keep
 * - else if starts with SA => replace SA with SA0 (SA1234 -> SA01234)
 * - else prefix SA0
 */
export const formatInvoiceNumber = (raw) => {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const upper = s.toUpperCase();

  if (upper.startsWith("SA0")) return upper;
  if (upper.startsWith("SA")) return "SA0" + upper.slice(2);
  return "SA0" + upper;
};

/** Proper Case (Title Case) for customer/staff */
export const toTitleCase = (input) => {
  const s = String(input ?? "").trim();
  if (!s) return "";
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
};

/** Value formatting: "₹ 34,556" (no decimals, keep commas) */
export const formatINR = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") return "-";
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";

  const rounded = Math.round(n);
  const formatted = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(rounded);
  return `₹ ${formatted}`;
};

/** ✅ Smaller grey status chip */
export const statusChipClass = () =>
  "h-6 min-w-[96px] inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-800 text-[11px]";

/** ✅ Smaller action buttons */
export const actionBtnClass = (type) => {
  const base =
    "h-8 min-w-[96px] rounded-md px-2 text-[11px] tracking-wide shadow-sm transition active:scale-[0.98]";

  if (type === "TAKEN") return `${base} bg-teal-600 text-white hover:bg-teal-700`;
  if (type === "VERIFY") return `${base} bg-black text-white hover:bg-gray-900`;
  if (type === "PACKED") return `${base} bg-green-600 text-white hover:bg-green-700`;

  return `${base} bg-gray-300 text-gray-800`;
};
