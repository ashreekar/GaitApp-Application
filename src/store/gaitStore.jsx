import { create } from 'zustand';

const SENSOR_KEYS = [
  "T1", "T2", "T3", "T4", "T5",
  "M1", "M2", "M3", "M4", "M5",
  "MM", "CM", "LM",
  "MH", "CH", "LH",
];

export const useGaitStore = create((set, get) => ({
  liveData: {
    leftPressure: {},
    rightPressure: {},
    battery: { L: 100, R: 100 },
    phase: "STANCE",
    history: [], // Keeps the last 50 readings for the charts
  },
  buffer: [], // Temporary storage for server polling

  // Called by BLE script every time data arrives
  addReading: (reading) => {
    const state = get();
    const newBuffer = [...state.buffer, reading];
    
    // Update the live UI state
    set((state) => {
      const newHistory = [...state.liveData.history, reading].slice(-50); // Keep last 50
      return {
        liveData: {
          leftPressure: reading.left,
          rightPressure: reading.right,
          battery: reading.battery,
          phase: reading.phase,
          history: newHistory,
        },
        buffer: newBuffer,
      };
    });

    // POLLING LOGIC: If buffer hits 8, send to server and clear
    if (newBuffer.length >= 8) {
      get().sendToServer(newBuffer);
      set({ buffer: [] }); // Reset buffer instantly
    }
  },

  sendToServer: async (dataBatch) => {
    try {
      console.log(`📡 Polling ${dataBatch.length} frames to server...`);
      // TODO: Replace with your actual API endpoint
      /*
      await fetch("https://your-api.com/api/gait/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: dataBatch, timestamp: Date.now() })
      });
      */
    } catch (err) {
      console.error("Server sync failed:", err);
    }
  }
}));

export { SENSOR_KEYS };