import { BleClient } from "@capacitor-community/bluetooth-le";
import { App } from "@capacitor/app";
import { useGaitStore, SENSOR_KEYS } from "../store/gaitStore";

export const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
export const CHAR_NOTIFY_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const EXPECTED_PACKET_SIZE = 33; // 16 sensors (32 bytes) + 1 battery (1 byte)

let connectedDevices = { LEFT: null, RIGHT: null };
let appStateListener = null;
let connecting = { LEFT: false, RIGHT: false };
let manualDisconnect = { LEFT: false, RIGHT: false };

// =====================================================
// INIT
// =====================================================
export async function initBLE() {
  try {
    await BleClient.initialize({ androidNeverForLocation: true });
    const state = useGaitStore.getState();

    if (state.leftDevice) connectDevice(state.leftDevice, "LEFT", true).catch(console.error);
    if (state.rightDevice) connectDevice(state.rightDevice, "RIGHT", true).catch(console.error);

    if (!appStateListener) {
      appStateListener = await App.addListener("appStateChange", async ({ isActive }) => {
        const current = useGaitStore.getState();
        
        // NEW: If app goes to background (user closed it), flush buffer and end session!
        if (!isActive) {
          current.forceEndSession();
          return;
        }
        
        if (current.leftConnection !== "connected" && current.leftDevice && !connectedDevices.LEFT) {
          connectDevice(current.leftDevice, "LEFT", true).catch(console.error);
        }
        if (current.rightConnection !== "connected" && current.rightDevice && !connectedDevices.RIGHT) {
          connectDevice(current.rightDevice, "RIGHT", true).catch(console.error);
        }
      });
    }
  } catch (err) {
    console.error("BLE init failed", err);
  }
}

// =====================================================
// SCAN
// =====================================================
export async function scanDevices(side) {
  const store = useGaitStore.getState();
  store.setConnectionState(side, "scanning");
  store.setFoundDevice(side, null);
  let deviceFound = false;

  try {
    await BleClient.requestLEScan({ services: [SERVICE_UUID] }, async (result) => {
      if (!result.device || deviceFound) return;
      deviceFound = true;
      await stopScanning(side);
      store.setFoundDevice(side, result.device);
    });

    setTimeout(async () => {
      if (!deviceFound) {
        await stopScanning(side);
        store.setFoundDevice(side, null);
      }
    }, 8000);
  } catch (err) {
    console.error(`Scan failed for ${side}:`, err);
    await stopScanning(side);
  }
}

export async function stopScanning(side) {
  try { await BleClient.stopLEScan(); } catch (e) {}
  const store = useGaitStore.getState();
  if (store[`${side.toLowerCase()}Connection`] === "scanning") {
    store.setConnectionState(side, "idle");
  }
}

// =====================================================
// CONNECT
// =====================================================
export async function connectDevice(device, side, isAuto = false) {
  if (connecting[side]) return;
  connecting[side] = true;
  const store = useGaitStore.getState();

  try {
    await stopScanning(side);
    store.setConnectionState(side, isAuto ? "reconnecting" : "connecting");

    await BleClient.connect(device.deviceId, async (id) => {
      console.log(`${side} Disconnected:`, id);
      connectedDevices[side] = null;
      if (manualDisconnect[side]) {
        manualDisconnect[side] = false;
        return;
      }
      store.setConnectionState(side, "idle");
    });

    connectedDevices[side] = device.deviceId;
    store.setConnectedDevice(side, device);
    store.setConnectionState(side, "connected");

    await new Promise((r) => setTimeout(r, 500));
    await startGaitDataStream(device.deviceId, side);
  } catch (err) {
    console.error(`${side} Connection failed:`, err);
    store.setConnectionState(side, "idle");
    throw err;
  } finally {
    connecting[side] = false;
  }
}

// =====================================================
// DISCONNECT
// =====================================================
export async function disconnectDevice(side) {
  if (!connectedDevices[side]) return;
  manualDisconnect[side] = true;
  const store = useGaitStore.getState();
  store.setConnectionState(side, "disconnecting");

  try {
    await BleClient.stopNotifications(connectedDevices[side], SERVICE_UUID, CHAR_NOTIFY_UUID);
    await BleClient.disconnect(connectedDevices[side]);
  } catch (err) {
    console.error(`${side} Disconnect failed:`, err);
  } finally {
    connectedDevices[side] = null;
    store.setConnectionState(side, "idle");
    store.setConnectedDevice(side, null);

    // NEW: If BOTH devices are now disconnected, stop the session!
    const currentState = useGaitStore.getState();
    if (currentState.leftConnection !== "connected" && currentState.rightConnection !== "connected") {
      currentState.forceEndSession();
    }
  }
}

// =====================================================
// STREAM
// =====================================================
export async function startGaitDataStream(deviceId, side) {
  await BleClient.startNotifications(deviceId, SERVICE_UUID, CHAR_NOTIFY_UUID, (value) => {
    const data = value instanceof DataView ? value : new DataView(value.buffer);
    
    if (data.byteLength !== EXPECTED_PACKET_SIZE) {
      console.warn(`Invalid ${side} packet size:`, data.byteLength);
      return;
    }

    const sensors = {};
    let avg = 0;

    for (let i = 0; i < SENSOR_KEYS.length; i++) {
      const val = data.getUint16(i * 2, true);
      sensors[SENSOR_KEYS[i]] = val;
      avg += val;
    }
    avg /= 16;
    const battery = data.getUint8(32);

    useGaitStore.getState().addReading(side, {
      timestamp: Date.now(),
      sensors,
      battery,
      avg,
    });
  });
}