import { create } from "zustand";
import {
  persist,
  createJSONStorage,
} from "zustand/middleware";

export const SENSOR_KEYS = [
  "T1", "T2", "T3", "T4", "T5",
  "M1", "M2", "M3", "M4", "M5",
  "MM", "CM", "LM",
  "MH", "CH", "LH",
];

const initialLiveData = {
  leftPressure: {},
  rightPressure: {},
  battery: {
    L: 100,
    R: 100,
  },
  phase: "STANCE",
  history: [],
};

export const useGaitStore = create(
  persist(
    (set, get) => ({

      hydrated: false,

      connectionState: "idle",

      connectedDevice: null,

      scanning: false,

      foundDevice: null,

      liveData: initialLiveData,

      buffer: [],

      // =====================================================
      // HYDRATION
      // =====================================================

      setHydrated: () =>
        set({ hydrated: true }),

      // =====================================================
      // CONNECTION
      // =====================================================

      setConnectionState: (
        state
      ) =>
        set({
          connectionState: state,
        }),

      setConnectedDevice: (
        device
      ) =>
        set({
          connectedDevice: device
            ? {
                deviceId:
                  device.deviceId,
                name:
                  device.name ||
                  "Gait Sensor",
              }
            : null,
        }),

      setScanning: (status) =>
        set({
          scanning: status,
        }),

      setFoundDevice: (
        device
      ) =>
        set({
          foundDevice: device,
        }),

      // =====================================================
      // LIVE DATA
      // =====================================================

      resetLiveData: () =>
        set({
          liveData:
            initialLiveData,
          buffer: [],
        }),

      addReading: (
        reading
      ) => {

        const state = get();

        const newBuffer = [
          ...state.buffer,
          reading,
        ];

        const newHistory = [
          ...state.liveData
            .history,

          {
            ...reading,

            displayTime:
              new Date(
                reading.timestamp
              ).toLocaleTimeString(),
          },
        ].slice(-50);

        set({
          liveData: {

            leftPressure:
              reading.left,

            rightPressure:
              reading.right,

            battery:
              reading.battery,

            phase:
              reading.phase,

            history:
              newHistory,
          },

          buffer:
            newBuffer,
        });

        if (
          newBuffer.length >= 8
        ) {

          get().sendToServer(
            newBuffer
          );

          set({
            buffer: [],
          });
        }
      },

      // =====================================================
      // SERVER
      // =====================================================

      sendToServer:
        async (dataBatch) => {

          try {

            console.log(
              `📡 Uploading ${dataBatch.length} frames`
            );

            // API CALL

          } catch (err) {

            console.error(
              "Upload failed:",
              err
            );
          }
        },
    }),

    {
      name: "gait-storage",

      storage:
        createJSONStorage(
          () => localStorage
        ),

      partialize: (
        state
      ) => ({
        connectedDevice:
          state.connectedDevice,
      }),

      onRehydrateStorage:
        () => (state) => {

          state?.setHydrated();
        },
    }
  )
);