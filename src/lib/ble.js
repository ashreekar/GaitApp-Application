import { BleClient } from "@capacitor-community/bluetooth-le";

import { App } from "@capacitor/app";

import {
  useGaitStore,
  SENSOR_KEYS,
} from "../store/gaitStore";

import { showToast } from "../lib/ToastUtils";

export const SERVICE_UUID =
  "4fafc201-1fb5-459e-8fcc-c5c9c331914b";

export const CHAR_NOTIFY_UUID =
  "beb5483e-36e1-4688-b7f5-ea07361b26a8";

const EXPECTED_PACKET_SIZE = 66;

let connectedDeviceId = null;

let appStateListener = null;

let connecting = false;

let manualDisconnect = false;

// =====================================================
// INIT
// =====================================================

export async function initBLE() {

  try {

    await BleClient.initialize({
      androidNeverForLocation: true,
    });

    console.log("BLE initialized");

    const state = useGaitStore.getState();

    // Auto reconnect

    if (state.connectedDevice) {

      console.log(
        "Attempting auto reconnect..."
      );

      try {

        await connectDevice(
          state.connectedDevice,
          true
        );

      } catch (err) {

        console.error(
          "Reconnect failed:",
          err
        );
      }
    }

    // App resume reconnect

    if (!appStateListener) {

      appStateListener =
        await App.addListener(
          "appStateChange",
          async ({ isActive }) => {

            if (!isActive) return;

            const current =
              useGaitStore.getState();

            if (
              current.connectionState !== "connected" &&
              current.connectedDevice &&
              !connectedDeviceId
            ) {

              console.log(
                "App resumed, reconnecting..."
              );

              try {

                await connectDevice(
                  current.connectedDevice,
                  true
                );

              } catch (err) {

                console.error(err);
              }
            }
          }
        );
    }

  } catch (err) {

    console.error("BLE init failed", err);

    showToast.error(
      "Bluetooth Error",
      "Please enable Bluetooth."
    );
  }
}

// =====================================================
// SCAN
// =====================================================

export async function scanDevices(onDeviceFound) {
  const store = useGaitStore.getState();

  store.setScanning(true);
  store.setFoundDevice(null);

  let deviceFound = false;

  showToast.loading(
    "Scanning",
    "Looking for Gait Sensor Modules..."
  );

  try {
    await BleClient.requestLEScan(
      {
        services: [SERVICE_UUID],
      },
      async (result) => {
        if (!result.device || deviceFound) return;

        deviceFound = true;

        console.log("BLE Device Found:", result.device);

        // Stop scan immediately once found
        await stopScanning();

        store.setFoundDevice(result.device);
        store.setScanning(false);

        onDeviceFound?.(result.device);

        showToast.success(
          "Device Found",
          result.device.name || "Gait module detected"
        );
      }
    );

    // AUTO STOP AFTER 8 SECONDS
    setTimeout(async () => {
      if (!deviceFound) {
        console.log("No BLE devices found");

        await stopScanning();

        store.setScanning(false);
        store.setFoundDevice(null);

        showToast.error(
          "No Devices Found",
          "Could not detect any gait sensor modules."
        );
      }
    }, 8000);

  } catch (err) {
    console.error("BLE Scan Error:", err);

    await stopScanning();

    store.setScanning(false);

    showToast.error(
      "Scan Failed",
      "Bluetooth scan could not start."
    );
  }
}

export async function stopScanning() {

  try {

    await BleClient.stopLEScan();

  } catch (e) {}

  const store = useGaitStore.getState();

  store.setScanning(false);

  if (
    store.connectionState === "scanning"
  ) {

    store.setConnectionState("idle");
  }
}

// =====================================================
// CLEANUP
// =====================================================

async function cleanupBleConnection() {

  if (!connectedDeviceId) return;

  try {

    await BleClient.stopNotifications(
      connectedDeviceId,
      SERVICE_UUID,
      CHAR_NOTIFY_UUID
    );

  } catch (e) {

    console.warn(
      "Notification cleanup failed",
      e
    );
  }
}

// =====================================================
// CONNECT
// =====================================================

export async function connectDevice(
  device,
  isAuto = false
) {

  if (connecting) return;

  connecting = true;

  const store = useGaitStore.getState();

  try {

    await stopScanning();

    store.setConnectionState(
      isAuto
        ? "reconnecting"
        : "connecting"
    );

    if (!isAuto) {

      showToast.loading(
        "Pairing",
        `Connecting to ${device.name || "sensor"}`
      );
    }

    await BleClient.connect(
      device.deviceId,

      async (id) => {

        console.log(
          "Unexpected disconnect:",
          id
        );

        connectedDeviceId = null;

        await cleanupBleConnection();

        if (manualDisconnect) {

          manualDisconnect = false;

          return;
        }

        store.setConnectionState("idle");

        showToast.error(
          "Connection Lost",
          "Sensor disconnected unexpectedly."
        );
      }
    );

    connectedDeviceId = device.deviceId;

    store.setConnectedDevice(device);

    store.setConnectionState("connected");

    if (!isAuto) {

      showToast.success(
        "Connected",
        "Live telemetry active"
      );

    } else {

      showToast.success(
        "Reconnected",
        "Sensor stream restored"
      );
    }

    await startGaitDataStream();

  } catch (err) {

    console.error(
      "Connection failed:",
      err
    );

    store.setConnectionState("idle");

    showToast.error(
      "Connection Failed",
      "Unable to connect to sensor"
    );

    throw err;

  } finally {

    connecting = false;
  }
}

// =====================================================
// DISCONNECT
// =====================================================

export async function disconnectDevice() {

  if (!connectedDeviceId) return;

  manualDisconnect = true;

  const store = useGaitStore.getState();

  store.setConnectionState(
    "disconnecting"
  );

  try {

    await cleanupBleConnection();

    await BleClient.disconnect(
      connectedDeviceId
    );

    showToast.success(
      "Disconnected",
      "Sensor safely disconnected"
    );

  } catch (err) {

    console.error(
      "Disconnect failed:",
      err
    );

  } finally {

    connectedDeviceId = null;

    store.setConnectionState("idle");

    store.setConnectedDevice(null);

    store.resetLiveData();
  }
}

// =====================================================
// STREAM
// =====================================================

export async function startGaitDataStream() {

  if (!connectedDeviceId) return;

  await BleClient.startNotifications(
    connectedDeviceId,

    SERVICE_UUID,

    CHAR_NOTIFY_UUID,

    (value) => {

      if (
        value.byteLength !==
        EXPECTED_PACKET_SIZE
      ) {

        console.warn(
          "Invalid packet size:",
          value.byteLength
        );

        return;
      }

      const left = {};

      const right = {};

      let avgL = 0;

      let avgR = 0;

      for (let i = 0; i < 16; i++) {

        const lVal =
          value.getUint16(i * 2, true);

        const rVal =
          value.getUint16(
            32 + i * 2,
            true
          );

        left[SENSOR_KEYS[i]] = lVal;

        right[SENSOR_KEYS[i]] = rVal;

        avgL += lVal;

        avgR += rVal;
      }

      avgL /= 16;

      avgR /= 16;

      const phase =
        avgL > avgR + 100
          ? "LEFT STANCE"
          : avgR > avgL + 100
          ? "RIGHT STANCE"
          : "DOUBLE SUPPORT";

      const reading = {

        timestamp: Date.now(),

        left,

        right,

        battery: {
          L: value.getUint8(64),
          R: value.getUint8(65),
        },

        phase,

        AVG_L: avgL,

        AVG_R: avgR,
      };

      for (let i = 0; i < 16; i++) {

        reading[
          `${SENSOR_KEYS[i]}_L`
        ] = left[SENSOR_KEYS[i]];

        reading[
          `${SENSOR_KEYS[i]}_R`
        ] = right[SENSOR_KEYS[i]];
      }

      useGaitStore
        .getState()
        .addReading(reading);
    }
  );
}