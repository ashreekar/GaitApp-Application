import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const SENSOR_KEYS = [
  "T1", "T2", "T3", "T4", "T5",
  "M1", "M2", "M3", "M4", "M5",
  "MM", "CM", "LM", "MH", "CH", "LH",
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

export const useGaitStore = create(
  persist(
    (set, get) => ({
      hydrated: false,
      
      // Dual Device Connection States
      leftDevice: null, rightDevice: null,
      leftConnection: "idle", rightConnection: "idle",
      foundLeftDevice: null, foundRightDevice: null,
      
      // Data State
      latestAvgL: 0, latestAvgR: 0,
      liveData: initialLiveData, buffer: [],

      // =====================================================
      // STATE SETTERS
      // =====================================================
      setHydrated: () => set({ hydrated: true }),
      setConnectionState: (side, state) => set({ [`${side.toLowerCase()}Connection`]: state }),
      setFoundDevice: (side, device) => set({ [`found${side.charAt(0) + side.slice(1).toLowerCase()}Device`]: device }),
      setConnectedDevice: (side, device) => set({
        [`${side.toLowerCase()}Device`]: device ? { deviceId: device.deviceId, name: device.name || `${side} Sensor` } : null,
      }),
      resetLiveData: () => set({ liveData: initialLiveData, buffer: [], latestAvgL: 0, latestAvgR: 0 }),

      // =====================================================
      // DATA MERGING & PROCESSING
      // =====================================================
      addReading: (side, reading) => {
        const state = get();
        
        // Update the latest known averages and pressures for the incoming side
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
        const groundContactLeft = avgL > 100 ? 820 : 500;
        const groundContactRight = avgR > 100 ? 790 : 500;
        const stepLengthLeft = Number((avgL / 2000).toFixed(2));
        const stepLengthRight = Number((avgR / 2000).toFixed(2));
        const strideLength = Number((stepLengthLeft + stepLengthRight).toFixed(2));
        const fallRisk = asymmetry > 25 ? "HIGH" : asymmetry > 12 ? "MODERATE" : "LOW";
        const recoveryScore = Math.max(40, Math.min(100, Math.round(symmetry)));

        const phase = avgL > avgR + 100 ? "LEFT STANCE" : avgR > avgL + 100 ? "RIGHT STANCE" : "DOUBLE SUPPORT";

        // Flatten data for buffer upload
        const flatReading = { timestamp: reading.timestamp, phase, side_updated: side };
        SENSOR_KEYS.forEach((k) => {
          flatReading[`${k}_L`] = leftPressure[k] || 0;
          flatReading[`${k}_R`] = rightPressure[k] || 0;
        });

        const newBuffer = [...state.buffer, flatReading];

        set({
          latestAvgL: avgL, latestAvgR: avgR,
          liveData: {
            leftPressure, rightPressure, phase,
            battery: { L: batteryL, R: batteryR },
            history: state.liveData.history, // Removed history array buildup for performance
            analytics: {
              symmetry, asymmetry, velocity, cadence, pronationLeft, pronationRight, pronationIndex,
              groundContactLeft, groundContactRight, stepLengthLeft, stepLengthRight, strideLength,
              fallRisk, recoveryScore, steps: state.liveData.analytics.steps + (side === "LEFT" && avgL > 150 ? 1 : 0),
            },
          },
          buffer: newBuffer,
        });

        if (newBuffer.length >= 10) {
          get().sendToServer(newBuffer);
          set({ buffer: [] });
        }
      },

      sendToServer: async (dataBatch) => {
        try { console.log(`📡 Uploading ${dataBatch.length} dual-frames`); } 
        catch (err) { console.error("Upload failed:", err); }
      },
    }),
    {
      name: "gait-storage-dual",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ leftDevice: state.leftDevice, rightDevice: state.rightDevice }),
      onRehydrateStorage: () => (state) => { state?.setHydrated(); },
    }
  )
);