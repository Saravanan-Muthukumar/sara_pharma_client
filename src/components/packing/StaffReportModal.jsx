// src/components/packing/reports/StaffReportModal.jsx
const StaffReportModal = ({ open, isAdmin, selectedDate, report, onClose }) => {
    if (!open || !isAdmin) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
        <div className="w-full max-w-4xl rounded-lg bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Staff Report</h2>
              <p className="text-xs text-gray-500">
                Date: <b>{selectedDate}</b> • Total Invoices: <b>{report?.dayCount || 0}</b>
              </p>
            </div>
  
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
  
          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Staff</th>
                  <th className="px-3 py-2 text-left">Taking</th>
                  <th className="px-3 py-2 text-left">Taken</th>
                  <th className="px-3 py-2 text-left">Verifying</th>
                  <th className="px-3 py-2 text-left">Packed</th>
                </tr>
              </thead>
  
              <tbody>
                {!report?.rows?.length ? (
                  <tr className="border-t">
                    <td className="px-3 py-3 text-gray-500" colSpan={5}>
                      No invoices for this date
                    </td>
                  </tr>
                ) : (
                  report.rows.map((r) => (
                    <tr key={r.staff} className="border-t">
                      <td className="px-3 py-2 font-semibold">{r.staff}</td>
                      <td className="px-3 py-2">{r.taking}</td>
                      <td className="px-3 py-2">{r.taken}</td>
                      <td className="px-3 py-2">{r.verifying}</td>
                      <td className="px-3 py-2">{r.packed}</td>
                    </tr>
                  ))
                )}
  
                {/* ✅ TOTAL ROW (status totals only) */}
                <tr className="border-t bg-gray-50">
                  <td className="px-3 py-2 font-semibold">Total</td>
                  <td className="px-3 py-2 font-semibold">{report?.totals?.taking || 0}</td>
                  <td className="px-3 py-2 font-semibold">{report?.totals?.taken || 0}</td>
                  <td className="px-3 py-2 font-semibold">{report?.totals?.verifying || 0}</td>
                  <td className="px-3 py-2 font-semibold">{report?.totals?.packed || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default StaffReportModal;
  