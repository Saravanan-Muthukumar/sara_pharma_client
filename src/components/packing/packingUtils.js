// src/components/packing/packingUtils.js
import moment from "moment";

export const API = "https://octopus-app-l59s5.ondigitalocean.app";
// export const API = "http://localhost:9000";

// ✅ NEW statuses only
export const STATUS_TEXT = {
  TO_TAKE: "To take",
  TAKING: "Taking now",
  TO_VERIFY: "To verify",
  VERIFYING: "Verifying now",
  PACKED: "Packed",
};

// ✅ Billing/Admin tabs mapping (new statuses)
export const BILLING_TABS = [
  { key: "TO_TAKE", label: "To Take", status: "TO_TAKE" },
  { key: "TAKING", label: "Taking", status: "TAKING" },
  { key: "TO_VERIFY", label: "To Verify", status: "TO_VERIFY" },
  { key: "VERIFYING", label: "Verifying", status: "VERIFYING" },
  { key: "PACKED", label: "Packed", status: "PACKED" },
  { key: "ALL", label: "All Bills", status: "ALL" },
  { key: "OUTSTANDING", label: "Outstanding", status: "OUTSTANDING" }, // status <> PACKED (handled in backend/UI)
  { key: "UNPRINTED", label: "Unprinted", status: "UNPRINTED" }, // day-end logic (handled in backend)
];

export const isBlank = (v) => v === undefined || v === null || String(v).trim() === "";

/** Time format (only time) */
export const fmtTime = (ts) => (ts ? moment(ts).format("h:mm A") : "-");

/** Duration parts (HH:MM) */
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

/** Duration parts (HH:MM:SS) */
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

export const toTitleCase = (input) => {
  const s = String(input ?? "").trim();
  if (!s) return "";
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
};

export const formatINR = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") return "-";
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";

  const rounded = Math.round(n);
  const formatted = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(rounded);
  return `₹ ${formatted}`;
};

export const actionBtnClass = (type) => {
  const base =
    "h-8 min-w-[96px] rounded-md px-2 text-[11px] tracking-wide shadow-sm transition active:scale-[0.98]";

  if (type === "START") return `${base} bg-teal-600 text-white hover:bg-teal-700`;
  if (type === "TAKEN") return `${base} bg-teal-600 text-white hover:bg-teal-700`;
  if (type === "VERIFY") return `${base} bg-black text-white hover:bg-gray-900`;
  if (type === "PACKED") return `${base} bg-green-600 text-white hover:bg-green-700`;

  return `${base} bg-gray-300 text-gray-800`;
};

export const formatInvoiceNumberSA0 = (input) => {
  const raw = String(input ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Allow step-by-step typing
  if (raw === "" || raw === "S" || raw === "SA" || raw === "SA0") {
    return raw;
  }

  // Extract digits
  const digits = raw.replace(/\D/g, "").slice(0, 5);

  // If no digits yet, don't pad
  if (!digits) return "SA0";

  // Pad ONLY when digits exist
  const padded = digits.padStart(5, "0");

  return `SA0${padded}`;
};
  
  // validation for save
  export const isValidInvoiceNumberSA0 = (value) => {
    const s = String(value ?? "").trim().toUpperCase();
    return /^SA0\d{5}$/.test(s);
  };

  const norm = (s) => String(s || "").trim();

export const buildStaffReport = (rows = []) => {
  const byStaff = new Map();

  const inc = (staff, key) => {
    const name = norm(staff);
    if (!name) return;

    if (!byStaff.has(name)) {
      byStaff.set(name, { staff: name, taking: 0, taken: 0, verifying: 0, packed: 0, total: 0 });
    }
    const obj = byStaff.get(name);
    obj[key] += 1;
    obj.total += 1;
  };

  (rows || []).forEach((r) => {
    const status = String(r.status || "").toUpperCase();
    const takenBy = norm(r.taken_by);
    const packedBy = norm(r.packed_by);

    // in-progress counts
    if (status === "TAKING") inc(takenBy, "taking");
    if (status === "VERIFYING") inc(packedBy, "verifying");

    // completed counts (must use completed_at)
    if (r.take_completed_at) inc(takenBy, "taken");
    if (r.pack_completed_at) inc(packedBy, "packed");
  });

  const rowsOut = Array.from(byStaff.values()).sort((a, b) =>
    a.staff.localeCompare(b.staff, undefined, { sensitivity: "base" })
  );

  const totals = rowsOut.reduce(
    (acc, r) => {
      acc.taking += r.taking;
      acc.taken += r.taken;
      acc.verifying += r.verifying;
      acc.packed += r.packed;
      acc.total += r.total;
      return acc;
    },
    { taking: 0, taken: 0, verifying: 0, packed: 0, total: 0 }
  );

  return { rows: rowsOut, totals, dayCount: rows.length };
};