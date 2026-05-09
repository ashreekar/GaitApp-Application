import React, { useState } from "react";
import { Activity } from "lucide-react";

import SelectAuth from "../components/SelectAuth";
import Login from "../components/Login";
import SignUp from "../components/SignUp";

const Auth = () => {
  // 0: Select, 1: Login, 2: SignUp
  const [authStep, setAuthStep] = useState(0);

  const renderContent = () => {
    switch (authStep) {
      case 0:
        return <SelectAuth onNavigate={setAuthStep} />;

      case 1:
        return <Login onBack={() => setAuthStep(0)} />;

      case 2:
        return <SignUp onBack={() => setAuthStep(0)} />;

      default:
        return <SelectAuth onNavigate={setAuthStep} />;
    }
  };

  return (
    <div className="h-screen bg-white flex items-center justify-center px-6">
      
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
            <Activity className="text-white w-7 h-7" />
          </div>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            GaitApp
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Smart gait monitoring
          </p>

        </div>

        {/* Auth Content */}
        {renderContent()}

      </div>
    </div>
  );
};

export default Auth;