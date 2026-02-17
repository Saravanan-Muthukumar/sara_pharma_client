import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Edit from "../img/edit.png";
import Delete from "../img/delete.png";
import moment from "moment";
import Login from "./Login";
import { AuthContext } from "../context/authContext";

const Stationary = () => {
  const [data, setData] = useState([]);
  const { currentUser } = useContext(AuthContext);

  const [editPaid, setEditPaid] = useState("");
  const [datePaid, setDatePaid] = useState("");

  const navigate = useNavigate();

  const loadData = async () => {
    const response = await axios.get(
      "https://octopus-app-l59s5.ondigitalocean.app/stationaries/"
);
    setData(response.data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm Delete")) return;
    await axios.post(
      `https://octopus-app-l59s5.ondigitalocean.app/deletestationary/${id}`
    );
    loadData();
  };

  const handleEdit = (id) => {
    setEditPaid(id);
  };

  const handleSubmitPaid = async (id) => {
    try {
      await axios.put(
        `https://octopus-app-l59s5.ondigitalocean.app/editstationarypaid/${id}`,
        { date_paid: datePaid }
      );
      setDatePaid("");
      setEditPaid("");
      loadData();
      navigate("/stationary");
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const byDate = (a, b) => new Date(b.invoice_date) - new Date(a.invoice_date);

  if (!currentUser) return <Login />;

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Stationary Invoices</h1>
            <p className="text-xs text-gray-500">Manage supplier invoices and payments</p>
          </div>

          <Link to="/addstationary">
            <button className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
              + Add Invoice
            </button>
          </Link>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="max-h-[75vh] overflow-auto">
            <table className="min-w-full">
              {/* Head */}
              <thead className="sticky top-0 z-10 bg-gray-100">
                <tr className="text-left text-xs font-semibold text-gray-700">
                  <th className="px-4 py-3">S.No</th>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Invoice Number</th>
                  <th className="px-4 py-3">Invoice Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y">
                {data.sort(byDate).map((item, index) => {
                  const isEditing = editPaid === item.stationary_id;
                  const isPaid = !!item.date_paid;

                  return (
                    <tr
                      key={item.stationary_id}
                      className="text-sm text-gray-800 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{item.supplier_name}</td>
                      <td className="px-4 py-3">{item.invoice_number}</td>
                      <td className="px-4 py-3">{moment(item.invoice_date).format("D MMM YYYY")}</td>
                      <td className="px-4 py-3 font-semibold">
                        {item.invoice_amnt}
                      </td>{/* Payment cell */}
                      {!isEditing ? (
                        <td className="px-4 py-3"onClick={() => handleEdit(item.stationary_id)}>
                          <span
                            className={[
                              "inline-flex cursor-pointer items-center rounded-full px-2 py-1 text-xs font-semibold",
                              isPaid
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-800",
                            ].join(" ")}
                            title="Click to edit payment date"
                          >
                            {isPaid
                              ? moment(item.date_paid).format("D MMM YYYY")
                              : "Pending"}
                          </span>
                        </td>
                      ) : (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              value={datePaid}
                              onChange={(e) => setDatePaid(e.target.value)}
                              type="date"
                              className="h-9 rounded-md border px-2 text-xs outline-none focus:border-teal-600"
                            />
                            <button
                              onClick={() => handleSubmitPaid(item.stationary_id)}
                              className="h-9 rounded-md bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditPaid("");
                                setDatePaid("");
                              }}
                              className="h-9 rounded-md border px-3 text-xs hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      )}

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/editstationary/${item.stationary_id}`}
                            className="rounded-md border p-2 hover:bg-gray-50"
                            title="Edit invoice"
                          >
                            <img src={Edit} alt="Edit" className="h-4 w-4" />
                          </Link>

                          <button
                            className="rounded-md border border-red-200 bg-red-50 p-2 hover:bg-red-100"
                            onClick={() => handleDelete(item.stationary_id)}
                            title="Delete invoice"
                          >
                            <img src={Delete} alt="Delete" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {data.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stationary;
