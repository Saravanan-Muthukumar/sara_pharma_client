// src/hooks/packing/useCustomerTypeahead.js
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { API } from "../../components/packing/packingUtils";

export const useCustomerTypeahead = ({
  open,
  query,
  minChars = 1,
  debounceMs = 250,
}) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const lastReqId = useRef(0);

  const search = useCallback(
    async (q) => {
      const text = String(q || "").trim();
      if (!open || text.length < minChars) {
        setItems([]);
        setError("");
        return;
      }

      const reqId = ++lastReqId.current;
      setLoading(true);
      setError("");

      try {
        const res = await axios.get(`${API}/api/customers`, { params: { q: text } });
        if (reqId !== lastReqId.current) return; // ignore stale responses
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (reqId !== lastReqId.current) return;
        // eslint-disable-next-line no-console
        console.error(e);
        setError(e?.response?.data?.message || "Failed to search customers");
        setItems([]);
      } finally {
        if (reqId === lastReqId.current) setLoading(false);
      }
    },
    [open, minChars]
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => search(query), debounceMs);
    return () => clearTimeout(t);
  }, [open, query, debounceMs, search]);

  const clear = useCallback(() => {
    setItems([]);
    setError("");
    setLoading(false);
  }, []);

  return { loading, items, error, clear };
};
