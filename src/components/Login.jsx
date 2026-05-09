import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

const Login = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex flex-col">

      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-slate-500 mb-6 w-fit"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Login
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Sign in to continue
        </p>
      </div>

      {/* Form */}
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
      >

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
        />

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold active:scale-[0.98] transition"
        >
          Login
        </button>

      </form>
    </div>
  );
};

export default Login;