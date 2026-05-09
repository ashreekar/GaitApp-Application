export const homeData = {
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
  },

  gaitIndex: {
    pronationLeft: 10,
    pronationRight: 6,
    pronationIndex: 12,
  },

  groundContact: {
    left: 820,
    right: 690,
    unit: "ms",
  },

  stepMetrics: {
    steps: 5421,
    goal: 8000,
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

export const weeklyProgress = [
  { week: 1, symmetry: 60 },
  { week: 2, symmetry: 65 },
  { week: 3, symmetry: 70 },
  { week: 4, symmetry: 78 },
  { week: 5, symmetry: 82 },
  { week: 6, symmetry: 85 },
];

export const gaitCycleData = [
  { name: "Left", stance: 62, swing: 38 },
  { name: "Right", stance: 58, swing: 42 },
];