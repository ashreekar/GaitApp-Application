import { motion, AnimatePresence } from "framer-motion";
import { getUser, logout } from "../lib/auth";

export default function SettingsModal({ open, onClose }) {

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* BOTTOM SHEET */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-5 max-w-md mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
          >
            {/* HANDLE */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

            {/* USER INFO */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold">
                Hi, {getUser()?.fullName || "User"} 👋
              </h2>
              <p className="text-sm text-slate-500">{getUser()?.email}</p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-3">

              <button className="py-3 rounded-xl bg-slate-100">
                Profile
              </button>

              <button
                onClick={() => {
                  window.location.href = "/settings";
                }}
                className="py-3 rounded-xl bg-slate-100">
                Settings
              </button>

              <button
                onClick={() => {
                  logout();
                  window.location.href = "/auth";
                }}
                className="py-3 rounded-xl bg-red-500 text-white font-semibold"
              >
                Logout
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}