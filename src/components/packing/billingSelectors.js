// src/components/packing/billingSelectors.js
const norm = (s) => String(s || "").trim().toUpperCase();

export const getBillingCounts = (rows = []) => {
  const counts = {
    TO_TAKE: 0,
    TAKING: 0,
    TO_VERIFY: 0,
    VERIFYING: 0,
    PACKED: 0,
    ALL: 0,
    OUTSTANDING: 0,
    UNPRINTED: 0, // optional
  };

  (rows || []).forEach((r) => {
    const st = norm(r.status);
    counts.ALL += 1;

    if (counts[st] !== undefined) counts[st] += 1;

    if (["TO_TAKE", "TAKING", "TO_VERIFY", "VERIFYING"].includes(st)) {
      counts.OUTSTANDING += 1;
    }
  });

  return counts;
};

export const getBillingListByTab = (rows = [], tabKey = "ALL") => {
  const list = rows || [];
  const key = norm(tabKey);

  if (key === "ALL") return list;

  if (key === "OUTSTANDING") {
    return list.filter((r) =>
      ["TO_TAKE", "TAKING", "TO_VERIFY", "VERIFYING"].includes(norm(r.status))
    );
  }

  // status tabs
  return list.filter((r) => norm(r.status) === key);
};
