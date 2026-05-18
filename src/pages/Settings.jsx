import {
  scanDevices,
  connectDevice,
  disconnectDevice,
} from "../lib/ble";
import { initBLE } from "./lib/ble";
import { useEffect } from "react";
import { useGaitStore } from "../store/gaitStore";

export default function SettingsPage() {

  const connectionState =
    useGaitStore(
      (s) => s.connectionState
    );

  const connectedDevice =
    useGaitStore(
      (s) => s.connectedDevice
    );

  const scanning =
    useGaitStore(
      (s) => s.scanning
    );

  const foundDevice =
    useGaitStore(
      (s) => s.foundDevice
    );

  const setFoundDevice =
    useGaitStore(
      (s) => s.setFoundDevice
    );

  const connected =
    connectionState === "connected";

  const connecting =
    connectionState === "connecting" ||
    connectionState === "reconnecting";

    useEffect(()=>{
    initBLE();
  },[])

  async function handleScan() {

    try {

      setFoundDevice(null);

      await scanDevices();

    } catch (err) {

      console.error(err);
    }
  }

  async function handleConnect() {

    if (!foundDevice) return;

    try {

      await connectDevice(foundDevice);

      setFoundDevice(null);

    } catch (err) {

      console.error(err);
    }
  }

  async function handleDisconnect() {

    await disconnectDevice();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5 pb-24">

      <h1 className="text-xl font-black text-slate-800 mb-6">
        Settings
      </h1>

      <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">

        <div className="flex justify-between items-center">

          <div>

            <h2 className="font-bold text-slate-800">
              Gait Sensor Link
            </h2>

            <p className="text-xs text-slate-400 mt-1">

              {connected
                ? `Connected: ${connectedDevice?.name || "Gait Module"}`
                : foundDevice
                ? `Ready: ${foundDevice.name}`
                : scanning
                ? "Scanning..."
                : "No device connected"}

            </p>
          </div>

          <div className="flex gap-2">

            {!connected && !foundDevice && (

              <button
                onClick={handleScan}
                disabled={scanning || connecting}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                {scanning
                  ? "Scanning..."
                  : "Scan"}
              </button>
            )}

            {!connected && foundDevice && (

              <button
                onClick={handleConnect}
                disabled={connecting}
                className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-bold"
              >
                {connecting
                  ? "Connecting..."
                  : "Connect"}
              </button>
            )}

            {connected && (

              <button
                onClick={handleDisconnect}
                className="px-4 py-2 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}