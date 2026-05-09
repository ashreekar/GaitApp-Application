import React from "react";
import Navbar from "./Navbar";
import { isLoggedIn } from "../lib/auth";
import { useLoader } from "../context/LoaderContext";

const Layout = ({ children }) => {
  const session = isLoggedIn();
   const { loading } = useLoader();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">

       {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {session && <Navbar />}

      <main className="flex-1 px-4 pb-2 pt-4">
        <div className="max-w-md mx-auto pt-6">
          {children}
        </div>
      </main>

      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </div>
  );
};

export default Layout;