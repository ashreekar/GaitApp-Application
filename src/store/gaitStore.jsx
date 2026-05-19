import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../lib/axiosinstance";
import { API } from "../lib/api";

export const SENSOR_KEYS = [
  "T1", "T2", "T3", "T4", "T5", "M1", "M2", "M3", "M4", "M5", "MM", "CM", "LM", "MH", "CH", "LH",
];

const initialLiveData = {
  leftPressure: {}, rightPressure: {}, battery: { L: 100, R: 100 },
  phase: "STANCE", history: [],
  analytics: {
    symmetry: 0, asymmetry: 0, velocity: 0, cadence: 0,
    pronationLeft: 0, pronationRight: 0, pronationIndex: 0,
    groundContactLeft: 0, groundContactRight: 0,
    stepLengthLeft: 0, stepLengthRight: 0, strideLength: 0,
    fallRisk: "LOW", recoveryScore: 0, steps: 0,
  },
};

// Module-level variable to hold the 10-second inactivity timer
let sessionTimeoutId = null;

export const useGaitStore = create(
  persist(
    (set, get) => ({
      hydrated: false,
      leftDevice: null, rightDevice: null,
      leftConnection: "idle", rightConnection: "idle",
      foundLeftDevice: null, foundRightDevice: null,
      
      latestAvgL: 0, latestAvgR: 0,
      liveData: initialLiveData, buffer: [],

      // SESSION STATE
      sessionId: null,
      isSessionStarting: false,

      setHydrated: () => set({ hydrated: true }),
      setConnectionState: (side, state) => set({ [`${side.toLowerCase()}Connection`]: state }),
      setFoundDevice: (side, device) => set({ [`found${side.charAt(0) + side.slice(1).toLowerCase()}Device`]: device }),
      setConnectedDevice: (side, device) => set({
        [`${side.toLowerCase()}Device`]: device ? { deviceId: device.deviceId, name: device.name || `${side} Sensor` } : null,
      }),
      resetLiveData: () => set({ liveData: initialLiveData, buffer: [], latestAvgL: 0, latestAvgR: 0 }),

      addReading: async (side, reading) => {
        const state = get();

        // =====================================================
        // AUTO-SESSION MANAGER
        // =====================================================
        if (!state.sessionId && !state.isSessionStarting) {
          set({ isSessionStarting: true });
          try {
            const res = await api.post(API.startSession);
            set({ sessionId: res.data.session._id, isSessionStarting: false });
            console.log("🟢 Auto-Session Started:", res.data.session._id);
          } catch (err) {
            console.error("Failed to auto-start session:", err);
            set({ isSessionStarting: false });
          }
        }

        if (sessionTimeoutId) clearTimeout(sessionTimeoutId);
        sessionTimeoutId = setTimeout(async () => {
          const currentSessionId = get().sessionId;
          if (currentSessionId) {
            console.log("⏳ 10 seconds of inactivity detected. Ending session...");
            const currentBuffer = get().buffer;
            if (currentBuffer.length > 0) {
              await get().sendToServer(currentBuffer);
            }
            try {
              await api.post(API.endSession, { sessionId: currentSessionId });
              console.log("🔴 Auto-Session Ended");
            } catch (err) {
              console.error("Failed to end session:", err);
            }
            set({ sessionId: null, buffer: [] });
          }
        }, 10000); 

        // =====================================================
        // DATA PROCESSING
        // =====================================================
        const avgL = side === "LEFT" ? reading.avg : state.latestAvgL;
        const avgR = side === "RIGHT" ? reading.avg : state.latestAvgR;
        const leftPressure = side === "LEFT" ? reading.sensors : state.liveData.leftPressure;
        const rightPressure = side === "RIGHT" ? reading.sensors : state.liveData.rightPressure;
        const batteryL = side === "LEFT" ? reading.battery : state.liveData.battery.L;
        const batteryR = side === "RIGHT" ? reading.battery : state.liveData.battery.R;

        const symmetry = Math.max(0, 100 - Math.abs(avgL - avgR) / 10);
        const asymmetry = Math.abs(avgL - avgR) / 10;
        const pronationLeft = ((leftPressure.M1 || 0) + (leftPressure.M2 || 0)) / 2;
        const pronationRight = ((rightPressure.M1 || 0) + (rightPressure.M2 || 0)) / 2;
        const pronationIndex = Math.abs(pronationLeft - pronationRight) / 50;
        const cadence = 90 + Math.round((avgL + avgR) / 100);
        const velocity = Number((cadence * 0.0075).toFixed(2));
        const phase = avgL > avgR + 100 ? "LEFT STANCE" : avgR > avgL + 100 ? "RIGHT STANCE" : "DOUBLE SUPPORT";

        // 👇 ====== MISSING MATH RE-ADDED HERE ====== 👇
        const groundContactLeft = avgL > 100 ? 820 : 500;
        const groundContactRight = avgR > 100 ? 790 : 500;
        const stepLengthLeft = Number((avgL / 2000).toFixed(2));
        const stepLengthRight = Number((avgR / 2000).toFixed(2));
        const strideLength = Number((stepLengthLeft + stepLengthRight).toFixed(2));
        const fallRisk = asymmetry > 25 ? "HIGH" : asymmetry > 12 ? "MODERATE" : "LOW";
        const recoveryScore = Math.max(40, Math.min(100, Math.round(symmetry)));
        // 👆 ======================================== 👆

        const flatReading = { timestamp: reading.timestamp, phase, side_updated: side };
        SENSOR_KEYS.forEach((k) => {
          flatReading[`${k}_L`] = leftPressure[k] || 0;
          flatReading[`${k}_R`] = rightPressure[k] || 0;
        });

        const newBuffer = [...get().buffer, flatReading];

        set({
          latestAvgL: avgL, latestAvgR: avgR,
          liveData: {
            leftPressure, rightPressure, phase,
            battery: { L: batteryL, R: batteryR },
            history: state.liveData.history,
            analytics: {
              symmetry, asymmetry, velocity, cadence, 
              pronationLeft, pronationRight, pronationIndex,
              groundContactLeft, groundContactRight, 
              stepLengthLeft, stepLengthRight, strideLength,
              fallRisk, recoveryScore,
              steps: state.liveData.analytics.steps + (side === "LEFT" && avgL > 150 ? 1 : 0),
            },
          },
          buffer: newBuffer,
        });

        if (get().sessionId && newBuffer.length >= 40) {
          get().sendToServer(newBuffer);
          set({ buffer: [] });
        }
      },

      sendToServer: async (dataBatch) => {
        const { sessionId } = get();
        if (!sessionId) return;
        try {
          await api.post(API.sendFrames, { sessionId, frames: dataBatch });
        } catch (err) {
          console.error("Upload failed:", err);
        }
      },
    }),
    {
      name: "gait-storage-dual",
      storage: createJSONStorage(() => localStorage),
      // Prevent sessionId and buffers from persisting if app restarts
      partialize: (state) => ({ leftDevice: state.leftDevice, rightDevice: state.rightDevice }),
      onRehydrateStorage: () => (state) => { state?.setHydrated(); },
    }
  )
);