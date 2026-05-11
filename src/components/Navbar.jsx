import { Link, useLocation } from "react-router-dom";
import { Home, Radio, History, Activity } from "lucide-react";
import { motion } from "framer-motion";
import SettingsButton from "./SettingsButton";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Live", path: "/live", icon: Radio },
    { name: "Metrics", path: "/matrix", icon: Activity },
    { name: "History", path: "/history", icon: History },
  ];

  return (
    <>
      <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4">

        <div className="flex items-center gap-2 w-full max-w-md">

          {/* NAV BAR */}
          <div className="flex items-center justify-between flex-1 px-3 py-2 rounded-[28px] bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl">

            {navItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="relative flex flex-col items-center flex-1 py-1"
                >
                  {active && (
                    <motion.div
                      layoutId="pill"
                      className="absolute inset-0 mx-2 rounded-2xl bg-blue-100"
                    />
                  )}

                  <item.icon
                    size={22}
                    className={`relative z-10 ${
                      active ? "text-blue-600" : "text-slate-400"
                    }`}
                  />

                  <span
                    className={`relative z-10 text-[10px] mt-1 ${
                      active ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* SETTINGS BUTTON (SEPARATE FILE) */}
          <SettingsButton />

        </div>
      </div>
    </>
  );
}