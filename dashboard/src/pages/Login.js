import React, { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { PRODUCTION_URL } from "../utils/Api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();


  const { dispatch } = useAuthContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const { email, password } = form;
    if (!email || !password) {
      alert("Please fill all fields");
      setSubmitting(false);
      return;
    }

    try {
      const res = await axios.post(`${PRODUCTION_URL}/user/login`, {
        email,
        password,
        interface: "web",
      });

      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userData", JSON.stringify(res.data.user));
      dispatch({ type: "SIGN_IN_TOKEN", payload: res.data.token });
      dispatch({ type: "SIGN_IN_DATA", payload: res.data.user });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-red-50">
      <img src="/assets/images/logo.png" alt="Logo" />

      <form
        className="w-96 p-6 shadow-lg bg-white rounded-md"
        onSubmit={submit}
      >
        <h1 className="text-3xl block text-center font-semibold">
          <i className="fa-solid fa-user" /> Login
        </h1>
        <hr className="mt-3" />
        <div className="mt-3">
          <label htmlFor="email" className="block text-base mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="Enter Email..."
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="mt-3">
          <label htmlFor="password" className="block text-base mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600"
            placeholder="Enter Password..."
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <input type="checkbox" />
            <label>Remember Me</label>
          </div>
        </div>
        <div className="mt-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="border-2 border-indigo-700 bg-indigo-700 text-white py-1 w-full rounded-md hover:bg-transparent hover:text-indigo-700 font-semibold"
          >
            <i className="fa-solid fa-right-to-bracket" />
            &nbsp;&nbsp;{isSubmitting ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
