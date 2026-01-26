// src/components/packing/SimpleTabs.jsx
const SimpleTabs = ({ tabs, active, onChange, counts }) => {
  return (
    <div className="mt-4 w-full overflow-x-auto">
      <div className="inline-flex min-w-max rounded-md border bg-white">
        {tabs.map((t, idx) => {
          const isActive = active === t.key;
          const c = counts?.[t.key] ?? 0;

          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={[
                "px-3 py-2 text-xs whitespace-nowrap transition",
                idx !== 0 ? "border-l" : "",
                isActive ? "bg-teal-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              {t.label} <span className="opacity-80">({c})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleTabs;
