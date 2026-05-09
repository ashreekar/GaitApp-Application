import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import api from "../lib/axiosinstance";
import { API } from "../lib/api";
import { setSession } from "../lib/auth";
import { useLoader } from "../context/LoaderContext";
import toast from "react-hot-toast";

const SignUp = ({ onBack }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { setLoading } = useLoader();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await api.post(API.register, formData);

      const { user, accessToken } = res.data.data;

      setSession({
        user,
        token: accessToken,
      });
      toast.success("Login successful!");

      window.location.href = "/";

    } catch (err) {
      console.log("Signup error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Login failed");
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">

      <button onClick={onBack} className="mb-6 flex items-center gap-1">
        <ArrowLeft size={18} />
        Back
      </button>

      <h2 className="text-2xl font-bold">Create Account</h2>

      <form onSubmit={handleSignup} className="flex flex-col gap-4 mt-4">

        <input
          type="text"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          className="border p-3 rounded-xl"
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="border p-3 rounded-xl"
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="border p-3 rounded-xl"
        />

        <button className="bg-blue-600 text-white py-3 rounded-xl">
          Create Account
        </button>

      </form>
    </div>
  );
};

export default SignUp;