import { createBrowserRouter, RouterProvider, Outlet} from "react-router-dom"
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AddCollection from "./pages/AddCollection";
import AddEditCheque from "./pages/AddEditCheque";
import AddPurchaseIssue from "./pages/AddPurchaseIssue";
import Cheques from "./pages/Cheques";
import Collection from "./pages/Collection";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PurchaseIssues from "./pages/PurchaseIssues";
import Register from "./pages/Register";
import RepAdjustment from "./pages/RepAdjustment";
import './Style.scss'

const Layout =()=>{
  return (
    <>
      <Navbar/>
      <Outlet/>
      <Footer/>
    </>
  )
}
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
        path: "/collection",
        element: <Collection/>,
      },
      {
        path: "/addcollection",
        element: <AddCollection/>,
      },
      {
        path: "/editcollection/:id",
        element: <AddCollection/>,
      },
      {
        path: "/repadjustment",
        element:<RepAdjustment/>,
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
  return (
    <div className="app">
      <div className="container">
         <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;
