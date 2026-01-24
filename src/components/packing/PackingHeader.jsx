const PackingHeader = ({ isAdmin, onOpenReport, onOpenCreate }) => {
    return (
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Packing</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={onOpenReport}
              className="rounded-md border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Staff Report
            </button>
          )}
          <button
            onClick={onOpenCreate}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Add
          </button>
        </div>
      </div>
    );
  };
  
  export default PackingHeader;
  