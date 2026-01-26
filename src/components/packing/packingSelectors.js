// src/components/packing/packingSelectors.js
const norm = (s) => String(s || "").trim().toUpperCase();

export const isOutstanding = (r) =>
  ["TO_TAKE", "TAKING", "TO_VERIFY", "VERIFYING"].includes(norm(r.status));

export const getMyJob = (rows, me) =>
  (rows || []).filter((r) => {
    const st = norm(r.status);
    const takenBy = String(r.taken_by || "").trim();
    const packedBy = String(r.packed_by || "").trim();
    return (st === "TAKING" && takenBy === me) || (st === "VERIFYING" && packedBy === me);
  });

export const getToTake = (rows) => (rows || []).filter((r) => norm(r.status) === "TO_TAKE");
export const getToVerify = (rows) => (rows || []).filter((r) => norm(r.status) === "TO_VERIFY");

export const getOutstanding = (rows) => (rows || []).filter((r) => isOutstanding(r));

// “Completed today” based on your backend query definition:
export const getCompletedToday = (rows) =>
  (rows || []).filter((r) => !!r.take_completed_at || !!r.pack_completed_at);

export const getMyHeaderTotals = (rows, me) => {
  let take = 0;
  let verifyPacked = 0;

  (rows || []).forEach((r) => {
    const takenBy = String(r.taken_by || "").trim();
    const packedBy = String(r.packed_by || "").trim();
    if (takenBy === me && r.take_completed_at) take += 1;
    if (packedBy === me && r.pack_completed_at) verifyPacked += 1;
  });

  return { take, verifyPacked };
};

export const getCountsByStatus = (rows) => {
  const counts = { TO_TAKE: 0, TAKING: 0, TO_VERIFY: 0, VERIFYING: 0, PACKED: 0, ALL: 0, OUTSTANDING: 0 };
  (rows || []).forEach((r) => {
    const st = norm(r.status);
    counts.ALL += 1;
    if (counts[st] !== undefined) counts[st] += 1;
    if (["TO_TAKE", "TAKING", "TO_VERIFY", "VERIFYING"].includes(st)) counts.OUTSTANDING += 1;
  });
  return counts;
};
