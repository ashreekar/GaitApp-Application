import React from "react";
import Navbar from "./Navbar";
import { isLoggedIn } from "../lib/auth";
import { useLoader } from "../context/LoaderContext";

const Layout = ({ children }) => {
  const session = isLoggedIn();
  const { loading } = useLoader();

  return (
    // FIX 1: Added `overflow-x-hidden w-full max-w-[100vw]` to completely stop the screen from sliding left/right
    // FIX 2: Changed `min-h-screen` to `min-h-[100dvh]` so the navbar doesn't jump on mobile browsers
    <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-zinc-50 flex flex-col">
      
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {session && <Navbar />}

      {/* Main content area */}
      <main className="flex-1 px-4 pb-2 pt-4">
        <div className="max-w-md mx-auto pt-6">
          {children}
        </div>
      </main>

      {/* Safe area spacing for iOS devices */}
      <div className="h-[env(safe-area-inset-bottom)] bg-zinc-50" />
    </div>
  );
};

export default Layout;