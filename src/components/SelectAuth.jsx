import React from "react";

const SelectAuth = ({ onNavigate }) => {
  return (
    <div className="flex flex-col gap-3">
      
      <button
        onClick={() => onNavigate(1)}
        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold active:scale-[0.98] transition"
      >
        Login
      </button>

      <button
        onClick={() => onNavigate(2)}
        className="w-full border border-slate-200 text-slate-800 py-3.5 rounded-xl font-semibold active:scale-[0.98] transition"
      >
        Create Account
      </button>

    </div>
  );
};

export default SelectAuth;