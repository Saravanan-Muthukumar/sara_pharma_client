import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import moment from "moment";
import { AuthContext } from "../context/authContext";

import PackingHeader from "../components/packing/PackingHeader";
import DatePicker from "../components/packing/DatePicker";
import PackingTabs from "../components/packing/PackingTabs";
import AddEditInvoiceForm from "../components/packing/AddEditInvoiceForm";
import VerifyModal from "../components/packing/VerifyModal";
import StaffReportModal from "../components/packing/StaffReportModal";
import InvoiceList from "../components/packing/InvoiceList";

import { API, FILTERS, isBlank } from "../components/packing/packingUtils";

const Packaging = () => {
  const { currentUser } = useContext(AuthContext);
  const isAdmin = useMemo(() => currentUser?.role === "admin", [currentUser]);
  const todayStr = useMemo(() => moment().format("YYYY-MM-DD"), []);

  // data
  const [items, setItems] = useState([]);

  // view state
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [activeFilter, setActiveFilter] = useState("TAKING_IN_PROGRESS");

  // add/edit form
  const [openForm, setOpenForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const [form, setForm] = useState({
    invoiceNumber: "",
    noOfProducts: "",
    invoiceValue: "",
    customerName: "",
    courierName: "",
    staffName: "",
  });

  // verify modal
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifySaving, setVerifySaving] = useState(false);
  const [verifyInvoice, setVerifyInvoice] = useState(null);
  const [verifierName, setVerifierName] = useState("");
  const [verifyError, setVerifyError] = useState("");

  // report
  const [reportOpen, setReportOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await axios.get(`${API}/packing`);
    setItems(res.data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // prefill staff name from logged in user
  useEffect(() => {
    const name = currentUser?.name || currentUser?.username || currentUser?.fullName || "";
    setForm((p) => ({ ...p, staffName: name }));
  }, [currentUser]);

  // date filtered list
  const dayItems = useMemo(() => {
    return items.filter((it) => moment(it.created_at).format("YYYY-MM-DD") === selectedDate);
  }, [items, selectedDate]);

  // tab counts
  const tabCounts = useMemo(() => {
    const c = { TAKING_IN_PROGRESS: 0, TAKING_DONE: 0, VERIFY_IN_PROGRESS: 0, COMPLETED: 0, ALL: dayItems.length };
    for (const it of dayItems) c[it.status] = (c[it.status] || 0) + 1;
    return c;
  }, [dayItems]);

  // filtered by tab
  const filteredItems = useMemo(() => {
    const f = FILTERS.find((x) => x.key === activeFilter);
    if (!f || !f.statuses) return dayItems;
    return dayItems.filter((it) => f.statuses.includes(it.status));
  }, [dayItems, activeFilter]);

  // staff report
  const staffReport = useMemo(() => {
    const map = {};
    for (const it of dayItems) {
      const s = (it.staff_name || "Unknown").trim() || "Unknown";
      if (!map[s]) map[s] = { staff: s, take: 0, verified: 0, total: 0 };
      if (it.status === "TAKING_IN_PROGRESS" || it.status === "TAKING_DONE") map[s].take += 1;
      if (it.status === "VERIFY_IN_PROGRESS" || it.status === "COMPLETED") map[s].verified += 1;
      map[s].total += 1;
    }
    const rows = Object.values(map).sort((a, b) => b.total - a.total);
    const totals = rows.reduce((acc, r) => {
      acc.take += r.take;
      acc.verified += r.verified;
      acc.total += r.total;
      return acc;
    }, { take: 0, verified: 0, total: 0 });
    return { rows, totals, dayCount: dayItems.length };
  }, [dayItems]);

  const resetForm = useCallback(() => {
    setForm((p) => ({ ...p, invoiceNumber: "", noOfProducts: "", invoiceValue: "", customerName: "", courierName: "" }));
  }, []);

  const openCreate = useCallback(() => {
    setEditingInvoice(null);
    resetForm();
    setOpenForm(true);
  }, [resetForm]);

  const closeForm = useCallback(() => {
    setOpenForm(false);
    setEditingInvoice(null);
    resetForm();
  }, [resetForm]);

  const openEdit = useCallback((it) => {
    setEditingInvoice(it);
    setForm((p) => ({
      ...p,
      invoiceNumber: it.invoice_number || "",
      noOfProducts: String(it.no_of_products ?? ""),
      invoiceValue: it.invoice_value === null || it.invoice_value === undefined ? "" : String(it.invoice_value),
      customerName: it.customer_name || "",
      courierName: it.courier_name || "",
      staffName: it.staff_name || p.staffName,
    }));
    setOpenForm(true);
  }, []);

  const saveInvoice = useCallback(async () => {
    const { invoiceNumber, noOfProducts, invoiceValue, customerName, courierName, staffName } = form;

    if ([invoiceNumber, noOfProducts, customerName, courierName, staffName].some(isBlank)) {
      alert("Invoice number, qty, customer, courier, staff are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        invoice_number: invoiceNumber.trim(),
        no_of_products: Number(noOfProducts),
        invoice_value: invoiceValue === "" || invoiceValue === null ? null : Number(invoiceValue),
        customer_name: customerName.trim(),
        courier_name: courierName.trim(),
        staff_name: staffName.trim(),
      };

      if (editingInvoice?.invoice_id) {
        await axios.post(`${API}/packing/save`, { invoice_id: editingInvoice.invoice_id, ...payload });
      } else {
        await axios.post(`${API}/packing/save`, { ...payload, status: "TAKING_IN_PROGRESS" });
      }

      closeForm();
      await load();
    } catch (err) {
      alert(err?.response?.data || "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [form, editingInvoice, closeForm, load]);

  // actions
  const markTaken = useCallback(async (invoice_id) => {
    await axios.post(`${API}/packing/save`, { invoice_id, status: "TAKING_DONE" });
    await load();
  }, [load]);

  const openVerify = useCallback((it) => {
    setVerifyInvoice(it);
    setVerifierName("");
    setVerifyError("");
    setVerifyOpen(true);
  }, []);

  const closeVerify = useCallback(() => {
    if (verifySaving) return;
    setVerifyOpen(false);
    setVerifyInvoice(null);
    setVerifierName("");
    setVerifyError("");
  }, [verifySaving]);

  const confirmVerify = useCallback(async () => {
    if (!verifierName.trim()) {
      setVerifyError("Verifier name is required.");
      return;
    }
    setVerifySaving(true);
    setVerifyError("");
    try {
      await axios.post(`${API}/packing/save`, {
        invoice_id: verifyInvoice.invoice_id,
        status: "VERIFY_IN_PROGRESS",
        verifier_name: verifierName.trim(),
      });
      closeVerify();
      await load();
    } catch (err) {
      setVerifyError(err?.response?.data || "Failed to update status");
    } finally {
      setVerifySaving(false);
    }
  }, [verifierName, verifyInvoice, closeVerify, load]);

  const markPacked = useCallback(async (invoice_id) => {
    await axios.post(`${API}/packing/save`, { invoice_id, status: "COMPLETED" });
    await load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <PackingHeader
        isAdmin={isAdmin}
        onOpenReport={() => setReportOpen(true)}
        onOpenCreate={openCreate}
      />

        <DatePicker
        selectedDate={selectedDate}
        onChange={setSelectedDate}
        />  

      <PackingTabs
        filters={FILTERS}
        active={activeFilter}
        onChange={setActiveFilter}
        counts={tabCounts}
      />

      <AddEditInvoiceForm
        open={openForm}
        editingInvoice={editingInvoice}
        isAdmin={isAdmin}
        values={form}
        setValues={setForm}
        onSave={saveInvoice}
        onCancel={closeForm}
        saving={saving}
      />

      <VerifyModal
        open={verifyOpen}
        invoice={verifyInvoice}
        verifierName={verifierName}
        setVerifierName={setVerifierName}
        error={verifyError}
        onClose={closeVerify}
        onConfirm={confirmVerify}
        saving={verifySaving}
      />

      <StaffReportModal
        open={reportOpen}
        isAdmin={isAdmin}
        selectedDate={selectedDate}
        report={staffReport}
        onClose={() => setReportOpen(false)}
      />

        <InvoiceList
        items={filteredItems}
        onEdit={openEdit}
        onMarkTaken={markTaken}
        onOpenVerify={openVerify}
        onMarkPacked={markPacked}
        activeFilter={activeFilter}
        />
    </div>
  );
};

export default Packaging;
