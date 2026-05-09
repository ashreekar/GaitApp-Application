export const homeData = {
  patient: {
    name: "Ashreek",
    initials: "A",
    postOpWeek: 6,
    surgery: "ACL Reconstruction",
  },

  recovery: {
    score: 78,
    trend: 12,
    target: 85,
  },

  telemetry: {
    symmetry: 82,
    velocity: 0.78,
    asymmetry: 14,
    fallRisk: "MODERATE",
    steps: 5421,
    stepGoal: 8000,
  },

  gaitIndex: {
    pronationLeft: 10,
    pronationRight: 6,
    pronationIndex: 12,
  },

  lengthMetrics: {
    stepLeft: 0.42,
    stepRight: 0.48,
    target: 0.5,
    stride: 1.02,
    strideTarget: 1.2,
    cadence: 102,
  },

  physio: [
    { id: 1, name: "Heel Raises", sets: 3, target: "12 reps", completed: true, icon: "🦶" },
    { id: 2, name: "Balance Hold", sets: 2, target: "30 sec", completed: false, icon: "⚖️" },
    { id: 3, name: "Step Ups", sets: 3, target: "10 reps", completed: true, icon: "📈" },
  ],
};