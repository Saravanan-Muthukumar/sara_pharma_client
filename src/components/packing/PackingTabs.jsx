const PackingTabs = ({ filters, active, onChange, counts }) => {
    return (
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => {
          const isActive = active === f.key;
          const count = f.key === "ALL" ? counts.ALL : counts[f.key] ?? 0;
  
          return (
            <button
              key={f.key}
              onClick={() => onChange(f.key)}
              className={[
                "whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold",
                isActive
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              {f.label}{" "}
              <span className={isActive ? "text-white/90" : "text-gray-500"}>({count})</span>
            </button>
          );
        })}
      </div>
    );
  };
  
  export default PackingTabs;
  