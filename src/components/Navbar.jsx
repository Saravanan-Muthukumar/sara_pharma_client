// src/components/Navbar.jsx  (updated: /package -> /packing)
import React, { useContext, useState } from "react";
import Logo from "../img/logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const NavLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700"
  >
    {children}
  </Link>
);

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMenu();
    navigate("/login");
  };

  // Close menu when route changes
  React.useEffect(() => {
    closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Sara Pharma" className="h-10 w-auto sm:h-12" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 sm:flex">
            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700"
              to="/"
            >
              HOME
            </Link>

            {currentUser && (
              <>
                <Link
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                  to="/stationary"
                >
                  STATIONARY
                </Link>

                {/* ✅ changed here */}
                <Link
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                  to="/packing"
                >
                  PACKING
                </Link>
                <Link
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                  to="/feedback"
                >
                  FEEDBACK
                </Link>
              </>
            )}

            {currentUser && (
              <span className="ml-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                {currentUser.username}
              </span>
            )}

            {currentUser ? (
              <button
                onClick={handleLogout}
                className="ml-2 rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 active:bg-teal-800"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-2 rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 active:bg-teal-800"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 sm:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu panel */}
        {open && (
          <div className="pb-3 sm:hidden">
            <div className="rounded-lg border bg-white p-2 shadow-sm">
              <NavLink to="/" onClick={closeMenu}>
                HOME
              </NavLink>

              {currentUser && (
                <>
                  <NavLink to="/stationary" onClick={closeMenu}>
                    STATIONARY
                  </NavLink>

                  {/* ✅ changed here */}
                  <NavLink to="/packing" onClick={closeMenu}>
                    PACKING
                  </NavLink>
                  <NavLink to="/feedback" onClick={closeMenu}>
                    FEEDBACK
                  </NavLink>

                  <div className="mt-2 flex items-center justify-between px-3">
                    <span className="text-xs font-semibold text-gray-600">
                      {currentUser.username}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="rounded-md bg-teal-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
              {!currentUser && (
                <div className="mt-2 px-3">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block rounded-md bg-teal-600 px-3 py-2 text-center text-sm font-semibold text-white"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
