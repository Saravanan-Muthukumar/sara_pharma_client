// src/components/packing/customers/CustomerTypeaheadInput.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { toTitleCase } from "../packingUtils";
import { useCustomerTypeahead } from "../../../hooks/packing/useCustomerTypeahead";

const CustomerTypeaheadInput = ({
  open,
  value,
  onChange,
  onSelect,
  placeholder = "Customer Name *",
}) => {
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = useRef(null);

  const { loading, items, error, clear } = useCustomerTypeahead({
    open,
    query: value,
    minChars: 1,
    debounceMs: 200,
  });

  const suggestions = useMemo(() => (items || []).slice(0, 10), [items]);

  useEffect(() => {
    setHighlight(suggestions.length ? 0 : -1);
  }, [suggestions.length]);

  const commit = (c) => {
    if (!c) return;
    onSelect?.(c);
    clear();
    setHighlight(-1);
  };

  const onKeyDown = (e) => {
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(suggestions[highlight]);
    } else if (e.key === "Escape") {
      clear();
    }
  };

  useEffect(() => {
    const handler = (evt) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(evt.target)) clear();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [clear]);

  return (
    <div ref={wrapRef} className="relative">
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-teal-600"
        autoComplete="off"
      />

      {String(value || "").trim().length >= 1 && (loading || error || suggestions.length > 0) && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-white shadow-lg">
          {loading && <div className="px-3 py-2 text-xs text-gray-500">Searching…</div>}

          {!loading && error && <div className="px-3 py-2 text-xs text-red-600">{error}</div>}

          {!loading && !error && suggestions.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-500">No customers found</div>
          )}

          {!loading &&
            !error &&
            suggestions.map((c, idx) => {
              const active = idx === highlight;
              return (
                <button
                  key={c.customer_id}
                  type="button"
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => commit(c)}
                  className={[
                    "flex w-full items-start justify-between gap-2 px-3 py-2 text-left text-sm",
                    active ? "bg-teal-50" : "bg-white hover:bg-gray-50",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-gray-900">
                      {toTitleCase(c.customer_name)}
                    </div>
                    <div className="truncate text-[11px] text-gray-500">
                      Rep: {toTitleCase(c.rep_name) || "-"} · Courier:{" "}
                      {toTitleCase(c.courier_name) || "-"}
                    </div>
                  </div>

                  {c.city && (
                    <div className="shrink-0 text-[11px] text-gray-500">
                      {toTitleCase(c.city)}
                    </div>
                  )}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default CustomerTypeaheadInput;
