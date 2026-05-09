import { Settings } from "lucide-react";
import { useState } from "react";
import SettingsModal from "./SettingsModal";

export default function SettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-14 h-14 rounded-full bg-white shadow-xl border border-slate-200 flex items-center justify-center active:scale-95 transition"
      >
        <Settings className="text-slate-600" />
      </button>

      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}