// ✅ If you want a full safe App.js (drop-in) that includes the /package redirect
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import { useContext } from "react";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

import AddCollection from "./pages/AddCollection";
import AddPurchaseIssue from "./pages/AddPurchaseIssue";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PurchaseIssues from "./pages/PurchaseIssues";
import Register from "./pages/Register";
import Stationary from "./pages/Stationary";
import AddEditStationary from "./pages/AddEditStationary";

import "./Style.scss";
import "./index.css";

import Packingstaff from "./pages/packing/PackingStaff";
import BillingStaffPacking from "./pages/packing/BillingStaffPacking";
import AdminPacking from "./pages/packing/AdminPacking";

import { AuthContext } from "./context/authContext";

const Layout = () => (
  <div className="min-h-screen flex flex-col bg-white">
    <Navbar />
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const RequireAuth = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

const PackingGate = () => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) return <Navigate to="/login" replace />;

  const role = String(currentUser?.role || "").toLowerCase();
  if (role === "admin") return <Navigate to="/packing/admin" replace />;
  if (role === "billing") return <Navigate to="/packing/billing" replace />;
  return <Navigate to="/packing/staff" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/stationary", element: <Stationary /> },
      { path: "/addstationary", element: <AddEditStationary /> },
      { path: "/editstationary/:id", element: <AddEditStationary /> },

      { path: "/issues", element: <PurchaseIssues /> },
      { path: "/addpurchaseissue", element: <RequireAuth><AddPurchaseIssue /></RequireAuth> },
      { path: "/addpurchaseissue/:id", element: <RequireAuth><AddPurchaseIssue /></RequireAuth> },
      { path: "/addcollection", element: <RequireAuth><AddCollection /></RequireAuth> },

      // ✅ OLD URL redirect (this fixes your current 404)
      { path: "/package", element: <Navigate to="/packing" replace /> },

      // ✅ NEW packing routes
      { path: "/packing", element: <PackingGate /> },
      { path: "/packing/staff", element: <RequireAuth><Packingstaff /></RequireAuth> },
      { path: "/packing/billing", element: <RequireAuth><BillingStaffPacking /></RequireAuth> },
      { path: "/packing/admin", element: <RequireAuth><AdminPacking /></RequireAuth> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);

function App() {
  // ✅ IMPORTANT: do NOT wrap AuthContexProvider here if it's already in index.js/main.jsx
  return <RouterProvider router={router} />;
}

export default App;
