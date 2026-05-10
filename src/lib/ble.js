import { BleClient } from "@capacitor-community/bluetooth-le";

const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const CHAR_UUID = "87654321-4321-4321-4321-abcdefabcdef";

let connectedDeviceId = null;

// INIT
export async function initBLE() {
  await BleClient.initialize();
  console.log("BLE initialized");
}

// SCAN
export async function scanDevices(onDevice) {
  console.log("Scanning...");

  await BleClient.requestLEScan({}, (result) => {
    console.log("FOUND:", result);

    if (result.deviceId) {
      onDevice(result);
    }
  });

  setTimeout(() => {
    BleClient.stopLEScan();
    console.log("Scan stopped");
  }, 5000);
}

// CONNECT
export async function connect(deviceId) {
  console.log("Connecting:", deviceId);

  await BleClient.connect(deviceId, () => {
    console.log("Disconnected");
    connectedDeviceId = null;
  });

  connectedDeviceId = deviceId;

  console.log("Connected:", deviceId);
}

// SEND COMMAND (ON/OFF)
export async function sendCommand(value) {
  if (!connectedDeviceId) {
    console.log("Not connected");
    return;
  }

  const data = new Uint8Array([value]);

  await BleClient.write(
    connectedDeviceId,
    SERVICE_UUID,
    CHAR_UUID,
    data
  );

  console.log("Sent:", value);
}