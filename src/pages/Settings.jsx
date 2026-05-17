import { useEffect, useState } from "react";
import { useGaitStore } from "../store/gaitStore";
import {
  initBLE,
  scanDevices,
  stopScanning,
  connectDevice,
  disconnectDevice,
} from "../lib/ble";

export default function SettingsPage() {
  // Read persistent state from global store
  const { isConnected, connectedDevice } = useGaitStore();
  
  // Local state only for scanning process
  const [scanning, setScanning] = useState(false);
  const [foundDevice, setFoundDevice] = useState(null); 

  useEffect(() => {
    initBLE();
    return () => {
      stopScanning();
    };
  }, []);

  const handleScanFlow = async () => {
    try {
      setScanning(true);
      setFoundDevice(null);
      
      await scanDevices(async (device) => {
        console.log("Target device located:", device);
        setFoundDevice(device);
        setScanning(false);
        await stopScanning(); 
      });
    } catch (err) {
      console.error("Scan Error:", err);
      setScanning(false);
    }
  };

  const handleConnectFlow = async () => {
    if (!foundDevice) return;
    try {
      // Connect and auto-start stream
      await connectDevice(foundDevice);
      setFoundDevice(null); // Clear local found device once connected globally
    } catch (err) {
      console.error("Connection setup failed:", err);
    }
  };

  const handleDisconnect = async () => {
    await disconnectDevice();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 pb-24">
      <h1 className="text-xl font-black text-slate-800 mb-6">Settings</h1>

      <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm mb-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-800">Gait Sensor Link</h2>
            <p className="text-xs text-slate-400 mt-1">
              {isConnected 
                ? `Connected: ${connectedDevice?.name || "Gait Module"}` 
                : foundDevice 
                ? `Ready: ${foundDevice.name || "Unknown Module"}`
                : scanning 
                ? "Looking for hardware..." 
                : "No device linked"}
            </p>
          </div>

          <div className="flex space-x-2">
            {/* If NOT connected, show Scan OR Connect buttons */}
            {!isConnected && (
              <>
                {!foundDevice ? (
                  <button
                    onClick={handleScanFlow}
                    disabled={scanning}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      scanning ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-blue-600 text-white"
                    }`}
                  >
                    {scanning ? "Scanning..." : "Scan Devices"}
                  </button>
                ) : (
                  <button
                    onClick={handleConnectFlow}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    Connect
                  </button>
                )}
              </>
            )}

            {/* If Connected, show manual disconnect button */}
            {isConnected && (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* Small Status Indicator */}
        <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isConnected
                ? "bg-green-500 w-full"
                : scanning
                ? "bg-blue-400 w-1/2 animate-pulse"
                : "bg-slate-300 w-1/4"
            }`}
          />
        </div>
      </div>
    </div>
  );
}