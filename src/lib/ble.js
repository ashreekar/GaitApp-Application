import {
  BleClient,
} from "@capacitor-community/bluetooth-le";

import {
  App,
} from "@capacitor/app";

import {
  useGaitStore,
  SENSOR_KEYS,
} from "../store/gaitStore";

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

    const state =
      useGaitStore.getState();

    // AUTO RECONNECT

    if (state.connectedDevice) {

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

    // APP RESUME

    if (!appStateListener) {

      appStateListener =
        await App.addListener(
          "appStateChange",

          async ({ isActive }) => {

            if (!isActive)
              return;

            const current =
              useGaitStore.getState();

            if (
              current.connectionState !==
                "connected" &&
              current.connectedDevice &&
              !connectedDeviceId
            ) {

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

    console.error(
      "BLE init failed",
      err
    );
  }
}

// =====================================================
// SCAN
// =====================================================

export async function scanDevices() {

  const store =
    useGaitStore.getState();

  store.setScanning(true);

  store.setConnectionState(
    "scanning"
  );

  store.setFoundDevice(null);

  let deviceFound = false;

  try {

    await BleClient.requestLEScan(
      {
        services: [SERVICE_UUID],
      },

      async (result) => {

        if (
          !result.device ||
          deviceFound
        ) {

          return;
        }

        deviceFound = true;

        console.log(
          "BLE Device Found:",
          result.device
        );

        await stopScanning();

        store.setFoundDevice(
          result.device
        );
      }
    );

    setTimeout(async () => {

      if (!deviceFound) {

        await stopScanning();

        store.setFoundDevice(null);
      }

    }, 8000);

  } catch (err) {

    console.error(
      "Scan failed:",
      err
    );

    await stopScanning();
  }
}

export async function stopScanning() {

  try {

    await BleClient.stopLEScan();

  } catch (e) {}

  const store =
    useGaitStore.getState();

  store.setScanning(false);

  if (
    store.connectionState ===
    "scanning"
  ) {

    store.setConnectionState(
      "idle"
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

  if (connecting)
    return;

  connecting = true;

  const store =
    useGaitStore.getState();

  try {

    await stopScanning();

    store.setConnectionState(
      isAuto
        ? "reconnecting"
        : "connecting"
    );

    await BleClient.connect(
      device.deviceId,

      async (id) => {

        console.log(
          "Disconnected:",
          id
        );

        connectedDeviceId = null;

        if (manualDisconnect) {

          manualDisconnect = false;

          return;
        }

        store.setConnectionState(
          "idle"
        );
      }
    );

    connectedDeviceId =
      device.deviceId;

    store.setConnectedDevice(
      device
    );

    store.setConnectionState(
      "connected"
    );

    await new Promise((r) =>
      setTimeout(r, 500)
    );

    await startGaitDataStream();

  } catch (err) {

    console.error(
      "Connection failed:",
      err
    );

    store.setConnectionState(
      "idle"
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

  if (!connectedDeviceId)
    return;

  manualDisconnect = true;

  const store =
    useGaitStore.getState();

  store.setConnectionState(
    "disconnecting"
  );

  try {

    await BleClient.stopNotifications(
      connectedDeviceId,
      SERVICE_UUID,
      CHAR_NOTIFY_UUID
    );

    await BleClient.disconnect(
      connectedDeviceId
    );

  } catch (err) {

    console.error(
      "Disconnect failed:",
      err
    );

  } finally {

    connectedDeviceId = null;

    store.setConnectionState(
      "idle"
    );

    store.setConnectedDevice(
      null
    );

    store.resetLiveData();
  }
}

// =====================================================
// STREAM
// =====================================================

export async function startGaitDataStream() {

  if (!connectedDeviceId)
    return;

  await BleClient.startNotifications(

    connectedDeviceId,

    SERVICE_UUID,

    CHAR_NOTIFY_UUID,

    (value) => {

      const data =
        value instanceof DataView
          ? value
          : new DataView(
              value.buffer
            );

      if (
        data.byteLength !==
        EXPECTED_PACKET_SIZE
      ) {

        console.warn(
          "Invalid packet size:",
          data.byteLength
        );

        return;
      }

      const left = {};

      const right = {};

      let avgL = 0;

      let avgR = 0;

      // =====================================================
      // PARSE SENSOR DATA
      // =====================================================

      for (
        let i = 0;
        i <
        SENSOR_KEYS.length;
        i++
      ) {

        const lVal =
          data.getUint16(
            i * 2,
            true
          );

        const rVal =
          data.getUint16(
            32 + i * 2,
            true
          );

        left[
          SENSOR_KEYS[i]
        ] = lVal;

        right[
          SENSOR_KEYS[i]
        ] = rVal;

        avgL += lVal;

        avgR += rVal;
      }

      avgL /= 16;

      avgR /= 16;

      // =====================================================
      // PHASE
      // =====================================================

      const phase =
        avgL > avgR + 100
          ? "LEFT STANCE"
          : avgR > avgL + 100
          ? "RIGHT STANCE"
          : "DOUBLE SUPPORT";

      // =====================================================
      // READING
      // =====================================================

      const reading = {

        timestamp:
          Date.now(),

        left,

        right,

        battery: {

          L: data.getUint8(64),

          R: data.getUint8(65),
        },

        phase,

        AVG_L: avgL,

        AVG_R: avgR,
      };

      // =====================================================
      // FLATTEN FOR CHARTS
      // =====================================================

      for (
        let i = 0;
        i <
        SENSOR_KEYS.length;
        i++
      ) {

        reading[
          `${SENSOR_KEYS[i]}_L`
        ] =
          left[
            SENSOR_KEYS[i]
          ];

        reading[
          `${SENSOR_KEYS[i]}_R`
        ] =
          right[
            SENSOR_KEYS[i]
          ];
      }

      useGaitStore
        .getState()
        .addReading(reading);
    }
  );
}