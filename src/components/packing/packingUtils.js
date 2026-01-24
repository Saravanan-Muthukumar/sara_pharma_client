import moment from "moment";

/* =========================
   API
========================= */
export const API = "https://octopus-app-l59s5.ondigitalocean.app";

/* =========================
   STATUS TEXT (invoice card)
========================= */
export const STATUS_TEXT = {
  TAKING_IN_PROGRESS: "Taking now",
  TAKING_DONE: "Take completed",
  VERIFY_IN_PROGRESS: "Verifying now",
  COMPLETED: "Packed",
};

/* =========================
   FILTER TABS
========================= */
export const FILTERS = [
  { key: "TAKING_IN_PROGRESS", label: "Taking now", statuses: ["TAKING_IN_PROGRESS"] },
  { key: "TAKING_DONE", label: "To verify", statuses: ["TAKING_DONE"] },
  { key: "VERIFY_IN_PROGRESS", label: "Verifying now", statuses: ["VERIFY_IN_PROGRESS"] },
  { key: "COMPLETED", label: "Packed", statuses: ["COMPLETED"] },
  { key: "ALL", label: "All", statuses: null },
];

/* =========================
   HELPERS
========================= */
export const isBlank = (v) =>
  v === undefined || v === null || String(v).trim() === "";

/* =========================
   TIME FORMATTERS
========================= */
export const fmtTime = (ts) =>
  ts ? moment(ts).format("h:mm A") : "-";

/* =========================
   DURATION (HH:MM)
   Used in ALL tab
========================= */
export const durationPartsHM = (startTs) => {
  if (!startTs) return { hh: "00", mm: "00" };

  const start = new Date(startTs).getTime();
  const now = Date.now();
  if (!Number.isFinite(start) || now < start) return { hh: "00", mm: "00" };

  const totalMin = Math.floor((now - start) / 60000);
  const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const mm = String(totalMin % 60).padStart(2, "0");

  return { hh, mm };
};

/* =========================
   DURATION (HH:MM:SS)
   Used in in-progress tabs
========================= */
export const durationPartsHMS = (startTs) => {
  if (!startTs) return { hh: "00", mm: "00", ss: "00" };

  const start = new Date(startTs).getTime();
  const now = Date.now();
  if (!Number.isFinite(start) || now < start)
    return { hh: "00", mm: "00", ss: "00" };

  const totalSec = Math.floor((now - start) / 1000);
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");

  return { hh, mm, ss };
};

/* =========================
   UI STYLES
========================= */

/* Grey status chip */
export const statusChipClass = () =>
  "h-9 min-w-[120px] inline-flex items-center justify-center rounded-md bg-gray-200 text-gray-800 text-xs tracking-wide";

/* Action buttons */
export const actionBtnClass = (type) => {
  const base =
    "h-9 min-w-[120px] rounded-md px-3 text-xs tracking-wide shadow-sm transition active:scale-[0.98]";

  if (type === "TAKEN") return `${base} bg-teal-600 text-white hover:bg-teal-700`;
  if (type === "VERIFY") return `${base} bg-black text-white hover:bg-gray-900`;
  if (type === "PACKED") return `${base} bg-green-600 text-white hover:bg-green-700`;

  return `${base} bg-gray-300 text-gray-800`;
};
