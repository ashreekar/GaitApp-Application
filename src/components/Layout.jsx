import React from 'react';
import Navbar from "./Navbar";

const Layout = ({ children, session = false }) => {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Navbar sits fixed or sticky at the top */}
      {session && <Navbar />}

      <main className={`
        flex-1 w-full flex flex-col
        ${session ? "pt-4" : "pt-0"} 
        px-4 pb-2
      `}>
        {/* This container ensures content doesn't hit the very top of the screen */}
        <div className="pt-6 w-full max-w-md mx-auto">
          {children}
        </div>
      </main>

      {/* Optional: Add a subtle 'Safe Area' bottom spacer for iPhones */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </div>
  );
};

export default Layout;