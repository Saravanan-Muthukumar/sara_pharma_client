// src/components/packing/InvoiceList.jsx
import InvoiceCard from "./InvoiceCard";

const InvoiceList = ({
  list = [],
  mode, // "MY_JOB" | "TO_TAKE" | "TO_VERIFY" | "BILLING" etc (InvoiceCard decides)
  loading,
  emptyText = "No bills",
  currentUsername,
  disableActions = false,
  disableVerifyStartForRow, // fn(invoice)->bool
  actions,
}) => {
  if (!loading && (!list || list.length === 0)) {
    return <div className="rounded-md border bg-white p-3 text-xs text-gray-500">{emptyText}</div>;
  }

  return (
    <div className="space-y-3">
      {(list || []).map((it) => {
        const rowDisable =
          typeof disableVerifyStartForRow === "function"
            ? disableVerifyStartForRow(it) || disableActions
            : disableActions;

        return (
          <InvoiceCard
            key={it.invoice_id}
            it={it}
            mode={mode}
            currentUsername={currentUsername}
            onStartTaking={actions?.startTaking}
            onMarkTaken={actions?.markTaken}
            onStartVerify={actions?.startVerify}
            onMarkPacked={actions?.markPacked}
            disableActions={rowDisable}
          />
        );
      })}
    </div>
  );
};

export default InvoiceList;
