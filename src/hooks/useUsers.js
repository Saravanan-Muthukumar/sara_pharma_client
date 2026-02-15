// src/hooks/packing/useUsers.js
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API } from "../components/packing/packingUtils";

export const useUsers = ({ open = true } = {}) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/getusers`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError(e?.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, users, error, reload: load };
};
