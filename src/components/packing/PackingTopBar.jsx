// src/components/packing/PackingTopBar.jsx
import { toTitleCase } from "./packingUtils";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const PackingTopBar = ({ title, username, totals, onRefresh, rightActions }) => {
  const safeTotals = totals || { take: 0, verifyPacked: 0 };

  const { currentUser } = useContext(AuthContext);
  const isAdmin = String(currentUser?.role || "").toLowerCase() === "admin";

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        {/* Left */}
        <div>
          <h1 className="text-sm font-semibold text-gray-900">{title}</h1>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <div className="text-xs text-gray-600">{toTitleCase(username) || "-"}</div>

            {!isAdmin && (
              <span className="rounded-full border bg-white px-2 py-0.5 text-[11px] text-gray-700">
                Take: <b>{safeTotals.take}</b>
              </span>
            )}

            {!isAdmin && (
              <span className="rounded-full border bg-white px-2 py-0.5 text-[11px] text-gray-700">
                Verify &amp; Packed: <b>{safeTotals.verifyPacked}</b>
              </span>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {rightActions}

          <button
            type="button"
            onClick={onRefresh}
            className="h-8 rounded-md border px-3 text-xs hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackingTopBar;
