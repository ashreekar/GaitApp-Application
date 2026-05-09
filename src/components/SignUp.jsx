import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

const SignUp = ({ onBack }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

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
          Create Account
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Create your account to continue
        </p>
      </div>

      {/* Form */}
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
      >

        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({
              ...formData,
              fullName: e.target.value,
            })
          }
          className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
          className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value,
            })
          }
          className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
        />

        {/* Create Account Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold active:scale-[0.98] transition"
        >
          Create Account
        </button>

      </form>
    </div>
  );
};

export default SignUp;