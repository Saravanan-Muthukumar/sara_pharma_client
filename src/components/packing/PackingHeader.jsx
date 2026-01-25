const PackingHeader = ({ isAdmin, onOpenReport, onOpenCreate }) => {
    return (
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Packing</h1>
  
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={onOpenReport}
              className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Report
            </button>
          )}
  
          <button
            onClick={onOpenCreate}
            className="rounded-md bg-teal-600 px-3 py-2 text-sm text-white hover:bg-teal-700"
          >
            Add Invoice to take stock
          </button>
        </div>
      </div>
    );
  };
  
  export default PackingHeader;
  