import InvoiceCard from "./InvoiceCard";

const InvoiceList = ({
  items,
  onEdit,
  onMarkTaken,
  onOpenVerify,
  onMarkPacked,
  activeFilter, // ✅ receive
}) => {
  if (!items || items.length === 0) {
    return <p className="mt-6 text-center text-sm text-gray-500">No invoices yet</p>;
  }

  return (
    <div className="mt-6 space-y-3">
      {items.map((it) => (
        <InvoiceCard
          key={it.invoice_id}
          it={it}
          onEdit={onEdit}
          onMarkTaken={onMarkTaken}
          onOpenVerify={onOpenVerify}
          onMarkPacked={onMarkPacked}
          activeFilter={activeFilter} // ✅ pass down
        />
      ))}
    </div>
  );
};

export default InvoiceList;
