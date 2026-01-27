// Numeric part only: "SA000123" -> 123
export const invoiceNumPart = (inv) => {
    const s = String(inv || "").trim();
    const digits = s.replace(/\D/g, ""); // keep only digits
    if (!digits) return null;
    const n = Number(digits);
    return Number.isFinite(n) ? n : null;
  };
  
  // Build "SA0xxxxx" from number (pads to 5 digits)
  export const makeInvoiceSA0 = (n) => `SA0${String(n).padStart(5, "0")}`;
  
  export const findMissingInvoices = ({
    startInvoice,
    endInvoice,
    rowsToday,
  }) => {
    const startN = invoiceNumPart(startInvoice);
    const endN = invoiceNumPart(endInvoice);
  
    if (!Number.isFinite(startN) || !Number.isFinite(endN)) {
      return { missing: [], error: "Start/End invoice invalid" };
    }
    if (endN < startN) {
      return { missing: [], error: "End invoice must be >= Start invoice" };
    }
  
    const present = new Set(
      (rowsToday || [])
        .map((r) => invoiceNumPart(r.invoice_number))
        .filter((x) => Number.isFinite(x))
    );
  
    const missingNums = [];
    for (let n = startN; n <= endN; n += 1) {
      if (!present.has(n)) missingNums.push(n);
    }
  
    return {
      missing: missingNums.map(makeInvoiceSA0),
      error: "",
    };
  };
  