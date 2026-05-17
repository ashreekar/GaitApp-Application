import { BleClient } from "@capacitor-community/bluetooth-le";
import { useGaitStore, SENSOR_KEYS } from "../store/gaitStore";

export const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
export const CHAR_NOTIFY_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

let connectedDeviceId = null;

export async function initBLE() {
  try {
    await BleClient.initialize({ androidNeverForLocation: true });
    console.log("BLE Stack online");
  } catch (err) {
    console.error("BLE Init fail:", err);
  }
}

export async function scanDevices(onDeviceFound) {
  await BleClient.requestLEScan({
    services: [SERVICE_UUID] 
  }, (result) => {
    if (result.device) {
      onDeviceFound(result.device);
    }
  });

  // Automatically turn off scan engine after 8 seconds if nothing is found
  setTimeout(async () => {
    await stopScanning();
  }, 8000);
}

export async function stopScanning() {
  try {
    await BleClient.stopLEScan();
    console.log("Scan radio disabled safely");
  } catch (e) {
    // Already idle
  }
}

export async function connectDevice(deviceId, onDisconnectCallback) {
  // CRITICAL STEP FOR OPPO/MOTO: Scan must be stopped completely before connecting
  await stopScanning();
  
  await BleClient.connect(deviceId, (id) => {
    connectedDeviceId = null;
    if (onDisconnectCallback) onDisconnectCallback(id);
  });

  connectedDeviceId = deviceId;
  console.log("Device handshake completed successfully");
}

export async function disconnectDevice() {
  if (connectedDeviceId) {
    try {
      await BleClient.disconnect(connectedDeviceId);
    } catch (e) {
      console.error(e);
    }
    connectedDeviceId = null;
  }
}

export async function startGaitDataStream() {
  if (!connectedDeviceId) return;

  await BleClient.startNotifications(
    connectedDeviceId,
    SERVICE_UUID,
    CHAR_NOTIFY_UUID,
    (value) => {
      // payload structure: 
      // bytes 0-31: Left foot (16 * uint16)
      // bytes 32-63: Right foot (16 * uint16)
      // byte 64: Left Battery (uint8)
      // byte 65: Right Battery (uint8)
      
      if(value.byteLength < 66) return; // Drop malformed packets

      const left = {};
      const right = {};
      let avgL = 0;
      let avgR = 0;

      // Extract 16-bit sensor data
      for (let i = 0; i < 16; i++) {
        const lVal = value.getUint16(i * 2, true); // true = Little Endian
        const rVal = value.getUint16(32 + (i * 2), true);
        
        left[SENSOR_KEYS[i]] = lVal;
        right[SENSOR_KEYS[i]] = rVal;
        
        avgL += lVal;
        avgR += rVal;
      }

      avgL = avgL / 16;
      avgR = avgR / 16;

      const batL = value.getUint8(64);
      const batR = value.getUint8(65);

      // Determine phase (Simple logic: if pressure is high on left, it's left stance)
      const phase = avgL > avgR + 100 ? "LEFT STANCE" : 
                    avgR > avgL + 100 ? "RIGHT STANCE" : "DOUBLE SUPPORT";

      // Flatten data for the charts
      const reading = {
        displayTime: new Date().toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 1 }),
        left,
        right,
        battery: { L: batL, R: batR },
        phase,
        AVG_L: avgL,
        AVG_R: avgR,
      };

      // Add flattened keys for the chart (T1_L, T1_R, etc.)
      for (let i = 0; i < 16; i++) {
        reading[`${SENSOR_KEYS[i]}_L`] = left[SENSOR_KEYS[i]];
        reading[`${SENSOR_KEYS[i]}_R`] = right[SENSOR_KEYS[i]];
      }

      // Push to Zustand store!
      useGaitStore.getState().addReading(reading);
    }
  );
}