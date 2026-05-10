import { useEffect, useState } from "react";
import {
  initBLE,
  scanDevices,
  connect,
  sendCommand,
} from "../lib/ble";

export default function SettingsPage() {
  const [deviceLinked, setDeviceLinked] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [deviceName, setDeviceName] = useState("No device");

  useEffect(() => {
    initBLE().then(() => {
      console.log("BLE Ready");
    });
  }, []);

  const toggleDevice = async () => {
    try {
      // 🔵 CONNECT FLOW
      if (!deviceLinked) {
        setScanning(true);
        console.log("Scanning for STM32...");

        await scanDevices(async (device) => {
          console.log("Device found:", device);

          setDeviceName(device.name || "STM32 Device");

          await connect(device.deviceId);

          await sendCommand(1); // ON signal

          setDeviceLinked(true);
          setScanning(false);
        });

        // stop scanning fallback
        setTimeout(() => {
          setScanning(false);
        }, 6000);
      }

      // 🔴 DISCONNECT FLOW
      else {
        await sendCommand(0); // OFF signal
        setDeviceLinked(false);
        setDeviceName("No device");
      }
    } catch (err) {
      console.error("BLE Error:", err);
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 pb-24">

      {/* HEADER */}
      <h1 className="text-xl font-black text-slate-800 mb-6">
        Settings
      </h1>

      {/* DEVICE CARD */}
      <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm mb-5">

        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-800">
              Device Connection
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              {scanning
                ? "Scanning for STM32..."
                : deviceName}
            </p>
          </div>

          <button
            onClick={toggleDevice}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              deviceLinked
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {scanning
              ? "Scanning..."
              : deviceLinked
              ? "Linked"
              : "Not Linked"}
          </button>
        </div>

        {/* STATUS BAR */}
        <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              deviceLinked
                ? "bg-green-500 w-full"
                : scanning
                ? "bg-blue-400 w-1/2 animate-pulse"
                : "bg-slate-300 w-1/4"
            }`}
          />
        </div>
      </div>

      {/* ABOUT */}
      <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">

        <h2 className="font-bold text-slate-800 mb-2">
          About System
        </h2>

        <p className="text-sm text-slate-500 leading-relaxed">
          Gait analysis system connected to STM32 BLE sensor module for
          real-time biomechanical tracking and movement analysis.
        </p>

        <div className="mt-4 text-xs text-slate-400">
          Version 1.0.0 • STM32 BLE Integration
        </div>
      </div>

    </div>
  );
}