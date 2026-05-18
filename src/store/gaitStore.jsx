import { create } from 'zustand';

export const SENSOR_KEYS = [
  "T1", "T2", "T3", "T4", "T5",
  "M1", "M2", "M3", "M4", "M5",
  "MM", "CM", "LM",
  "MH", "CH", "LH",
];

export const useGaitStore = create((set, get) => ({
  // --- CONNECTION STATE ---
  isConnected: false,
  connectedDevice: null,
  scanning: false,
  foundDevice: null,

  setScanning: (status) => set({ scanning: status }),
  setFoundDevice: (device) => set({ foundDevice: device }),
  
  setConnectionStatus: (status, device = null) => set({ 
    isConnected: status, 
    connectedDevice: device 
  }),

  // --- DATA STATE ---
  liveData: {
    leftPressure: {},
    rightPressure: {},
    battery: { L: 100, R: 100 },
    phase: "STANCE",
    history: [],
  },
  buffer: [],

  addReading: (reading) => {
    const state = get();
    const newBuffer = [...state.buffer, reading];
    
    set((state) => {
      const newHistory = [...state.liveData.history, reading].slice(-50);
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

    if (newBuffer.length >= 8) {
      get().sendToServer(newBuffer);
      set({ buffer: [] }); 
    }
  },

  sendToServer: async (dataBatch) => {
    try {
      console.log(`📡 Polling ${dataBatch.length} frames to server...`);
      // API call goes here
    } catch (err) {
      console.error("Server sync failed:", err);
    }
  }
}));