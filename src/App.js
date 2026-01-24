import { createBrowserRouter, RouterProvider, Outlet} from "react-router-dom"
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AddCollection from "./pages/AddCollection";
import AddEditCheque from "./pages/AddEditCheque";
import AddPurchaseIssue from "./pages/AddPurchaseIssue";
import Cheques from "./pages/Cheques";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PurchaseIssues from "./pages/PurchaseIssues";
import Register from "./pages/Register";
import './Style.scss'
import Stationary from "./pages/Stationary";
import AddEditStationary from "./pages/AddEditStationary";
import Billing from "./pages/Billing";
import "./index.css";
import Packaging from "./pages/Packaging";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children:[
      {
        path: "/",
        element: <Home/>,
      },
      {
        path: "/cheques",
        element: <Cheques/>,
      },
      {
        path: "/stationary",
        element: <Stationary/>,
      },
      {
        path: "/addstationary",
        element: <AddEditStationary/>,
      },
      {
        path: "/editstationary/:id",
        element: <AddEditStationary/>,
      },
      {
        path: "/addcheque",
        element: <AddEditCheque/>,
      },
      {
        path: "/editcheque/:id",
        element: <AddEditCheque/>,
      },
      {
        path: "/issues",
        element: <PurchaseIssues/>,
      },
      {
        path: "/addpurchaseissue",
        element: <AddPurchaseIssue/>,
      },
      {
        path: "/addpurchaseissue/:id",
        element: <AddPurchaseIssue/>,
      },
      {
        path: "/billing",
        element: <Billing/>,
      },
      {
        path: "/addcollection",
        element: <AddCollection/>,
      },
      {
        path: "/package",
        element: <Packaging/>,
      },

    ]
  },

  {
    path: "/login",
    element: <Login/>,
  },
  {
    path: "/register",
    element: <Register/>,
  },

]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

