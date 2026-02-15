// src/hooks/packing/useCustomers.js
import { useCallback, useState } from "react";
import axios from "axios";
import { API } from "../components/packing/packingUtils";

export const useCustomers = () => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/customers`, { params: { q } });
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError(e?.response?.data?.message || "Failed to load customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async ({ customer_id, customer_name, city, rep_name, courier_name }) => {
    const payload = {
      customer_name: String(customer_name || "").trim(),
      city: String(city || "").trim() || null,
      rep_name: String(rep_name || "").trim() || null,
      courier_name: String(courier_name || "").trim() || null,
    };

    if (!payload.customer_name) throw new Error("Customer name is required");

    if (customer_id) {
      await axios.put(`${API}/api/customers/${customer_id}`, payload);
    } else {
      await axios.post(`${API}/api/customers`, payload);
    }
  }, []);

  const remove = useCallback(async (customer_id) => {
    await axios.delete(`${API}/api/customers/${customer_id}`);
  }, []);

  return { loading, customers, error, load, save, remove };
};
