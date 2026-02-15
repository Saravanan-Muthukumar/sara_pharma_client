// src/components/packing/common/RepSelect.jsx
import { useMemo } from "react";
import { toTitleCase } from "./packingUtils";

const RepSelect = ({ users = [], value, onChange, allowBlank = true, roleFilter = "billing" }) => {
  const reps = useMemo(() => {
    const list = (users || []).filter((u) => {
      if (!roleFilter) return true;
      return String(u.role || "").toLowerCase() === String(roleFilter).toLowerCase();
    });
    return list;
  }, [users, roleFilter]);

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-md border px-3 text-sm outline-none focus:border-teal-600"
    >
      {allowBlank && <option value="">Select rep</option>}
      {reps.map((u) => (
        <option key={u.id} value={u.username}>
          {toTitleCase(u.username)}
        </option>
      ))}
    </select>
  );
};

export default RepSelect;
