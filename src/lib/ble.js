import { BleClient } from "@capacitor-community/bluetooth-le";
import { useGaitStore, SENSOR_KEYS } from "../store/gaitStore";
import { showToast } from "./toastUtils"; // Import your new custom toasts

export const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
export const CHAR_NOTIFY_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

let connectedDeviceId = null;

export async function initBLE() {
  try {
    await BleClient.initialize({ androidNeverForLocation: true });
    console.log("BLE Stack online");
  } catch (err) {
    console.error("BLE Init fail:", err);
    showToast.error("Bluetooth Disabled", "Please enable Bluetooth to connect sensors.");
  }
}

export async function scanDevices(onDeviceFound) {
  showToast.loading("Scanning", "Looking for Gait Sensor Modules...");
  
  await BleClient.requestLEScan({ services: [SERVICE_UUID] }, (result) => {
    if (result.device) onDeviceFound(result.device);
  });

  setTimeout(async () => { await stopScanning(); }, 8000);
}

export async function stopScanning() {
  try {
    await BleClient.stopLEScan();
  } catch (e) {}
}

export async function connectDevice(device) {
  await stopScanning();
  showToast.loading("Pairing", `Connecting to ${device.name || "module"}...`);
  
  try {
    await BleClient.connect(device.deviceId, (id) => {
      // THIS FIRES IF SIGNAL IS LOST (Out of range, battery die, etc)
      console.log("Lost connection to device:", id);
      connectedDeviceId = null;
      useGaitStore.getState().setConnectionStatus(false, null);
      showToast.error("Connection Lost", "The sensor module went out of range or powered off.");
    });

    connectedDeviceId = device.deviceId;
    
    // Tell the global store we are officially connected
    useGaitStore.getState().setConnectionStatus(true, device);
    
    showToast.success("Paired Successfully", "Live telemetry stream active.");
    
    // Start streaming immediately
    await startGaitDataStream();

  } catch (error) {
    showToast.error("Pairing Failed", "Could not establish a stable connection.");
    throw error;
  }
}

export async function disconnectDevice() {
  if (connectedDeviceId) {
    try {
      await BleClient.disconnect(connectedDeviceId);
      showToast.ble("Disconnected", "Hardware safely unlinked.");
    } catch (e) {
      console.error(e);
    }
    connectedDeviceId = null;
    useGaitStore.getState().setConnectionStatus(false, null);
  }
}

export async function startGaitDataStream() {
  if (!connectedDeviceId) return;

  await BleClient.startNotifications(
    connectedDeviceId,
    SERVICE_UUID,
    CHAR_NOTIFY_UUID,
    (value) => {
      if(value.byteLength < 66) return; 

      const left = {};
      const right = {};
      let avgL = 0; let avgR = 0;

      for (let i = 0; i < 16; i++) {
        const lVal = value.getUint16(i * 2, true);
        const rVal = value.getUint16(32 + (i * 2), true);
        left[SENSOR_KEYS[i]] = lVal;
        right[SENSOR_KEYS[i]] = rVal;
        avgL += lVal; avgR += rVal;
      }

      const phase = (avgL/16) > (avgR/16) + 100 ? "LEFT STANCE" : 
                    (avgR/16) > (avgL/16) + 100 ? "RIGHT STANCE" : "DOUBLE SUPPORT";

      const reading = {
        displayTime: new Date().toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 1 }),
        left, right,
        battery: { L: value.getUint8(64), R: value.getUint8(65) },
        phase,
      };

      for (let i = 0; i < 16; i++) {
        reading[`${SENSOR_KEYS[i]}_L`] = left[SENSOR_KEYS[i]];
        reading[`${SENSOR_KEYS[i]}_R`] = right[SENSOR_KEYS[i]];
      }

      useGaitStore.getState().addReading(reading);
    }
  );
}