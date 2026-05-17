import { useEffect, useState } from "react";
import {
  initBLE,
  scanDevices,
  stopScanning,
  connectDevice,
  disconnectDevice,
  startGaitDataStream,
} from "../lib/ble";

export default function SettingsPage() {
  const [scanning, setScanning] = useState(false);
  const [foundDevice, setFoundDevice] = useState(null); // Keeps track of discovered device metadata
  const [deviceLinked, setDeviceLinked] = useState(false);
  const [liveGaitMetric, setLiveGaitMetric] = useState(0);

  useEffect(() => {
    initBLE();
    return () => {
      stopScanning();
    };
  }, []);

  // Step 1: Scan for the device
  const handleScanFlow = async () => {
    try {
      setScanning(true);
      setFoundDevice(null);
      
      await scanDevices(async (device) => {
        console.log("Target device located:", device);
        setFoundDevice(device);
        setScanning(false);
        await stopScanning(); // Stop scanning immediately once found to free up the BT radio
      });
    } catch (err) {
      console.error("Scan Error:", err);
      setScanning(false);
    }
  };

  // Step 2 & 3: Connect and instantly hook into the data stream
  const handleConnectFlow = async () => {
    if (!foundDevice) return;
    try {
      // Establish Connection
      await connectDevice(foundDevice.deviceId, () => {
        // Disconnect handler
        setDeviceLinked(false);
        setFoundDevice(null);
        setLiveGaitMetric(0);
      });

      setDeviceLinked(true);

      // Instantly start streaming incoming data right after connection success
      console.log("Connection verified. Auto-starting gait telemetry stream...");
      await startGaitDataStream((metric) => {
        setLiveGaitMetric(metric);
      });

    } catch (err) {
      console.error("Connection or streaming setup failed:", err);
    }
  };

  const handleDisconnect = async () => {
    await disconnectDevice();
    setDeviceLinked(false);
    setFoundDevice(null);
    setLiveGaitMetric(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 pb-24">
      <h1 className="text-xl font-black text-slate-800 mb-6">Settings</h1>

      {/* DEVICE MANAGEMENT CARD */}
      <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm mb-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-800">Gait Sensor Link</h2>
            <p className="text-xs text-slate-400 mt-1">
              {deviceLinked 
                ? `Connected: ${foundDevice?.name || "Gait Module"}` 
                : foundDevice 
                ? `Ready: ${foundDevice.name || "Unknown Module"}`
                : scanning 
                ? "Looking for hardware..." 
                : "No device linked"}
            </p>
          </div>

          {/* Action Button state workflow */}
          {!foundDevice && !deviceLinked && (
            <button
              onClick={handleScanFlow}
              disabled={scanning}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                scanning ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-blue-600 text-white"
              }`}
            >
              {scanning ? "Scanning..." : "Scan Devices"}
            </button>
          )}

          {foundDevice && !deviceLinked && (
            <button
              onClick={handleConnectFlow}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition"
            >
              Connect
            </button>
          )}

          {deviceLinked && (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* LIVE DATA READOUT */}
        {deviceLinked && (
          <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Gait Metric Stream</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div className="mt-2 text-3xl font-black text-slate-800">
              {liveGaitMetric} <span className="text-sm font-normal text-slate-400">Hz / Units</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}