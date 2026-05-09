import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import api from "../lib/axiosinstance";
import { API } from "../lib/api";
import { setSession } from "../lib/auth";
import { useLoader } from "../context/LoaderContext";
import toast from "react-hot-toast";

const Login = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setLoading } = useLoader();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await api.post(API.login, {
        email,
        password,
      });

      const { user, accessToken } = res.data.data;

      toast.success("Login successful!");
      setSession({
        user,
        token: accessToken,
      });

      // Capacitor-safe navigation
      window.location.href = "/";

    } catch (err) {
      console.log("Login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">

      <button onClick={onBack} className="flex items-center gap-1 mb-6">
        <ArrowLeft size={18} />
        Back
      </button>

      <h2 className="text-2xl font-bold">Login</h2>

      <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-4">

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 rounded-xl"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded-xl"
        />

        <button className="bg-blue-600 text-white py-3 rounded-xl">
          Login
        </button>

      </form>
    </div>
  );
};

export default Login;