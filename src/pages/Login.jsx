import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const Login = () => {
  const [inputs, setInputs] = useState({ username: "", password: "" });
  const [err, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(inputs);
      navigate("/");
    } catch (error) {
      setError(error?.response?.data || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-teal-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-md border border-black/5 p-6">
        <h1 className="text-2xl font-bold text-teal-700 text-center">Login</h1>
        <p className="mt-1 text-sm text-gray-600 text-center">
          Enter your username and password
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              required
              type="text"
              name="username"
              placeholder="username"
              value={inputs.username}
              onChange={handleChange}
              className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              required
              type="password"
              name="password"
              placeholder="password"
              value={inputs.password}
              onChange={handleChange}
              className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-teal-600"
            />
          </div>

          {err && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <button
            type="submit"
            className="h-11 w-full rounded-md bg-teal-600 text-sm font-semibold text-white shadow hover:bg-teal-700 active:bg-teal-800"
          >
            Login
          </button>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-teal-700 hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
