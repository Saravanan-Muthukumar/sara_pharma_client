// src/hooks/packing/useInvoicesToday.js
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API } from "../../components/packing/packingUtils";

export const useInvoicesToday = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/invoices/today`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load /api/invoices/today", err);
      setError(err?.response?.data?.message || "Failed to load invoices");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rows, loading, error, refresh, setRows };
};
