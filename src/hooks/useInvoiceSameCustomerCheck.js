// src/hooks/packing/useInvoiceSameCustomerCheck.js
import { useCallback, useEffect, useState } from "react";

export const useInvoiceSameCustomerCheck = ({ open, rows, customerName }) => {
  const [checking, setChecking] = useState(false);
  const [sameCustomerInvoices, setSameCustomerInvoices] = useState([]);

  const check = useCallback(() => {
    const customer = String(customerName || "").trim().toLowerCase();
    if (!open || !customer) {
      setSameCustomerInvoices([]);
      return;
    }

    setChecking(true);
    try {
      const matches = (rows || []).filter(
        (x) => String(x.customer_name || "").trim().toLowerCase() === customer
      );

      const invs = matches.map((r) => r.invoice_number).filter(Boolean);
      setSameCustomerInvoices(invs);
    } finally {
      setChecking(false);
    }
  }, [open, rows, customerName]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => check(), 250);
    return () => clearTimeout(t);
  }, [open, check]);

  return { checking, sameCustomerInvoices };
};
