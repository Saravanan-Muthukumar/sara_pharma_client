// src/hooks/packing/useSuppliers.js
import { useCallback, useState } from "react";
import axios from "axios";
import { API } from "../components/packing/packingUtils";

export const useSuppliers = () => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/suppliers`, { params: { q } });
      setSuppliers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to load suppliers");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async ({ supplier_id, supplier_name, city }) => {
    const payload = {
      supplier_name: String(supplier_name || "").trim(),
      city: String(city || "").trim() || null,
    };

    if (!payload.supplier_name) throw new Error("Supplier name is required");

    if (supplier_id) {
      await axios.put(`${API}/api/suppliers/${supplier_id}`, payload);
    } else {
      await axios.post(`${API}/api/suppliers`, payload);
    }
  }, []);

  const remove = useCallback(async (supplier_id) => {
    await axios.delete(`${API}/api/suppliers/${supplier_id}`);
  }, []);

  return { loading, suppliers, error, load, save, remove };
};