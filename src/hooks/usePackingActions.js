// src/hooks/packing/usePackingActions.js
import { useCallback, } from "react";
import { useState } from "react";
import axios from "axios";
import { API } from "../components/packing/packingUtils";

export const usePackingActions = ({ currentUsername, refresh }) => {
  const [actionError, setActionError] = useState("");
  const clearActionError = () => setActionError("");
  const post = useCallback(
    async (path, invoice_id) => {
      setActionError("");
      if (!currentUsername) {setActionError("Missing username"); 
            return {ok: false};}
      try {
        await axios.post(`${API}${path}`, { invoice_id, username: currentUsername });
      await refresh?.();
      return {ok: true};
    } catch (err) {
      const message = 
       err?.response?.data?.message || err?.message || "Request failed";
       setActionError(message);
       return {
        ok :false,
        status : err?.response?.status,
       };
    }
  },
    [currentUsername, refresh]
  );
  const startTaking = (invoice_id) => post("/api/packing/start-taking", invoice_id)
  const markTaken = (invoice_id) => post("/api/packing/mark-taken", invoice_id)
  const startVerify = (invoice_id) => post("/api/packing/start-verify", invoice_id)
  const markPacked = (invoice_id) => post("/api/packing/mark-packed", invoice_id)
  return { startTaking, markTaken, startVerify, markPacked, actionError,clearActionError };
};
