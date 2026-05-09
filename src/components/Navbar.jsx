import { Link, useLocation } from "react-router-dom";
import { Home, Radio, History, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "Live",
      path: "/live",
      icon: Radio,
    },
    {
      name: "Metrics",
      path: "/details/1",
      icon: Activity,
    },
    {
      name: "History",
      path: "/history",
      icon: History,
    },
  ];

  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4">
      
      <div className="flex items-center justify-between w-full max-w-md px-3 py-2 rounded-[28px] bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl">
        
        {navItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 py-1"
            >
              
              {/* Active Pill */}
              {active && (
                <motion.div
                  layoutId="navbar-pill"
                  className="absolute inset-0 mx-2 rounded-2xl bg-blue-100"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10">
                <item.icon
                  size={22}
                  className={`transition ${
                    active
                      ? "text-blue-600 scale-110"
                      : "text-slate-400"
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`relative z-10 text-[10px] mt-1 font-semibold transition ${
                  active
                    ? "text-blue-600"
                    : "text-slate-400"
                }`}
              >
                {item.name}
              </span>

            </Link>
          );
        })}
      </div>
    </div>
  );
}