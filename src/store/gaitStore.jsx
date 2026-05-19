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

  analytics: {

    symmetry: 0,

    asymmetry: 0,

    velocity: 0,

    cadence: 0,

    pronationLeft: 0,

    pronationRight: 0,

    pronationIndex: 0,

    groundContactLeft: 0,

    groundContactRight: 0,

    stepLengthLeft: 0,

    stepLengthRight: 0,

    strideLength: 0,

    fallRisk: "LOW",

    recoveryScore: 0,

    steps: 0,
  },
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

      addReading: (reading) => {

        const state = get();

        const avgL = reading.AVG_L;

        const avgR = reading.AVG_R;

        // =====================================================
        // ANALYTICS
        // =====================================================

        const symmetry =
          Math.max(
            0,
            100 -
            Math.abs(avgL - avgR) / 10
          );

        const asymmetry =
          Math.abs(avgL - avgR) / 10;

        const pronationLeft =
          (
            (reading.left.M1 || 0) +
            (reading.left.M2 || 0)
          ) / 2;

        const pronationRight =
          (
            (reading.right.M1 || 0) +
            (reading.right.M2 || 0)
          ) / 2;

        const pronationIndex =
          Math.abs(
            pronationLeft -
            pronationRight
          ) / 50;

        const cadence =
          90 +
          Math.round(avgL / 50);

        const velocity =
          Number(
            (cadence * 0.0075).toFixed(2)
          );

        const groundContactLeft =
          avgL > 100 ? 820 : 500;

        const groundContactRight =
          avgR > 100 ? 790 : 500;

        const stepLengthLeft =
          Number(
            (avgL / 2000).toFixed(2)
          );

        const stepLengthRight =
          Number(
            (avgR / 2000).toFixed(2)
          );

        const strideLength =
          Number(
            (
              stepLengthLeft +
              stepLengthRight
            ).toFixed(2)
          );

        const fallRisk =
          asymmetry > 25
            ? "HIGH"
            : asymmetry > 12
              ? "MODERATE"
              : "LOW";

        const recoveryScore =
          Math.max(
            40,
            Math.min(
              100,
              Math.round(symmetry)
            )
          );

        // =====================================================
        // HISTORY
        // =====================================================

        const newHistory = [
          ...state.liveData.history,

          {
            ...reading,

            displayTime:
              new Date(
                reading.timestamp
              ).toLocaleTimeString(),
          },
        ].slice(-50);

        // =====================================================
        // BUFFER
        // =====================================================

        const newBuffer = [
          ...state.buffer,
          reading,
        ];

        // =====================================================
        // UPDATE
        // =====================================================

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

            analytics: {

              symmetry,

              asymmetry,

              velocity,

              cadence,

              pronationLeft,

              pronationRight,

              pronationIndex,

              groundContactLeft,

              groundContactRight,

              stepLengthLeft,

              stepLengthRight,

              strideLength,

              fallRisk,

              recoveryScore,

              steps:
                state.liveData
                  .analytics
                  .steps + 1,
            },
          },

          buffer:
            newBuffer,
        });

        // =====================================================
        // SERVER
        // =====================================================

        if (newBuffer.length >= 8) {

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