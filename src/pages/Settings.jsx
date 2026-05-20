import { useEffect } from "react";
import { scanDevices, connectDevice, disconnectDevice, initBLE } from "../lib/ble";
import { useGaitStore } from "../store/gaitStore";

export default function SettingsPage() {
  const store = useGaitStore();

  useEffect(() => {
    initBLE();
  }, []);

  const handleScan = async (side) => {
    try { await scanDevices(side); } 
    catch (err) { console.error(err); }
  };

  const handleConnect = async (side, device) => {
    try {
      await connectDevice(device, side);
      store.setFoundDevice(side, null);
    } catch (err) { console.error(err); }
  };

  // Reusable component for Left/Right sensors
  const SensorCard = ({ side, device, connectionState, foundDevice }) => {
    const connected = connectionState === "connected";
    const connecting = connectionState === "connecting" || connectionState === "scanning";

    return (
      <div className="bg-white p-5 rounded-3xl shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">{side} Foot Sensor</h2>
            <p className="text-xs text-slate-500 mt-1">
              {connected ? `Connected: ${device?.name}`
                : foundDevice ? `Ready: ${foundDevice.name}`
                : connectionState === "scanning" ? "Scanning..."
                : "No device connected"}
            </p>
          </div>

          <div className="flex gap-2">
            {!connected && !foundDevice && (
              <button
                onClick={() => handleScan(side)}
                disabled={connecting}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-50"
              >
                {connectionState === "scanning" ? "Scanning..." : "Scan"}
              </button>
            )}

            {!connected && foundDevice && (
              <button
                onClick={() => handleConnect(side, foundDevice)}
                disabled={connecting}
                className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-bold"
              >
                {connectionState === "connecting" ? "Connecting..." : "Connect"}
              </button>
            )}

            {connected && (
              <button
                onClick={() => disconnectDevice(side)}
                className="px-4 py-2 rounded-xl bg-red-100 text-red-700 text-xs font-bold"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 pb-24">
      <h1 className="text-2xl font-black mb-6">Settings</h1>

      {/* SENSOR CONNECTIONS */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Device Links</h2>
        <SensorCard 
          side="LEFT" 
          device={store.leftDevice} 
          connectionState={store.leftConnection} 
          foundDevice={store.foundLeftDevice} 
        />
        <SensorCard 
          side="RIGHT" 
          device={store.rightDevice} 
          connectionState={store.rightConnection} 
          foundDevice={store.foundRightDevice} 
        />
      </div>

      {/* ABOUT SECTION */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">About Gait App</h2>
        <div className="bg-white p-5 rounded-3xl shadow-sm text-sm text-slate-600 space-y-4">
          <p>
            <strong className="text-slate-800 block mb-1">Gait Analysis System v1.0</strong>
            This application pairs with dual STM32 Bluetooth Low Energy (BLE) smart insoles to provide real-time biomechanical analysis.
          </p>
          <p>
            <strong className="text-slate-800 block mb-1">How it Works</strong>
            Each insole contains 16 highly sensitive pressure resistors mapping the toes, metatarsals, midfoot, and heel. The app processes this data to calculate symmetry, foot pronation, stride length, and fall risk in real time.
          </p>
          <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
            Built using React, Tailwind CSS, Zustand, and Capacitor BLE.
          </p>
        </div>
      </div>
    </div>
  );
}