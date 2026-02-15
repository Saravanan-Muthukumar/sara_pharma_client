// src/hooks/packing/usePackingActions.js
import { useCallback } from "react";
import axios from "axios";
import { API } from "../components/packing/packingUtils";

export const usePackingActions = ({ currentUsername, refresh }) => {
  const post = useCallback(
    async (path, invoice_id) => {
      if (!currentUsername) throw new Error("Missing username");
      await axios.post(`${API}${path}`, { invoice_id, username: currentUsername });
      await refresh?.();
    },
    [currentUsername, refresh]
  );

  const startTaking = useCallback(
    async (invoice_id) => post("/api/packing/start-taking", invoice_id),
    [post]
  );

  const markTaken = useCallback(
    async (invoice_id) => post("/api/packing/mark-taken", invoice_id),
    [post]
  );

  const startVerify = useCallback(
    async (invoice_id) => post("/api/packing/start-verify", invoice_id),
    [post]
  );

  const markPacked = useCallback(
    async (invoice_id) => post("/api/packing/mark-packed", invoice_id),
    [post]
  );

  return { startTaking, markTaken, startVerify, markPacked };
};
