import toast from "react-hot-toast";
import { Bluetooth, CheckCircle2, AlertTriangle, Info, Loader2 } from "lucide-react";

// Base animated container for the toasts
const ToastContainer = ({ t, children }) => (
  <div
    className={`${
      t.visible ? "animate-enter" : "animate-leave"
    } max-w-sm w-full bg-white/90 backdrop-blur-md shadow-xl rounded-[24px] border border-slate-100/50 pointer-events-auto flex overflow-hidden ring-1 ring-black/5`}
  >
    {children}
  </div>
);

export const showToast = {
  success: (title, message) =>
    toast.custom((t) => (
      <ToastContainer t={t}>
        <div className="flex items-center p-4 w-full">
          <div className="bg-green-100 p-2 rounded-2xl flex-shrink-0">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-bold text-slate-800">{title}</p>
            {message && <p className="mt-1 text-xs text-slate-500">{message}</p>}
          </div>
        </div>
      </ToastContainer>
    )),

  error: (title, message) =>
    toast.custom((t) => (
      <ToastContainer t={t}>
        <div className="flex items-center p-4 w-full">
          <div className="bg-rose-100 p-2 rounded-2xl flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-rose-600" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-bold text-slate-800">{title}</p>
            {message && <p className="mt-1 text-xs text-slate-500">{message}</p>}
          </div>
        </div>
      </ToastContainer>
    )),

  ble: (title, message) =>
    toast.custom((t) => (
      <ToastContainer t={t}>
        <div className="flex items-center p-4 w-full">
          <div className="bg-blue-100 p-2 rounded-2xl flex-shrink-0">
            <Bluetooth className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-bold text-slate-800">{title}</p>
            {message && <p className="mt-1 text-xs text-slate-500">{message}</p>}
          </div>
        </div>
      </ToastContainer>
    )),

  loading: (title, message) =>
    toast.custom(
      (t) => (
        <ToastContainer t={t}>
          <div className="flex items-center p-4 w-full">
            <div className="bg-slate-100 p-2 rounded-2xl flex-shrink-0">
              <Loader2 className="h-6 w-6 text-slate-600 animate-spin" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-bold text-slate-800">{title}</p>
              {message && <p className="mt-1 text-xs text-slate-500">{message}</p>}
            </div>
          </div>
        </ToastContainer>
      ),
      { duration: 4000 } // Loaders usually stay slightly longer
    ),
};