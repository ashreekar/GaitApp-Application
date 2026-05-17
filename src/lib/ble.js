import { BleClient } from "@capacitor-community/bluetooth-le";

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

export async function startGaitDataStream(onDataReceived) {
  if (!connectedDeviceId) return;

  await BleClient.startNotifications(
    connectedDeviceId,
    SERVICE_UUID,
    CHAR_NOTIFY_UUID,
    (value) => {
      // Reads 4 bytes as unsigned integer sent from ESP32
      const data = value.getUint32(0, true); 
      onDataReceived(data);
    }
  );
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