import { useState, useEffect, useMemo } from "react";
import { useGaitStore } from "../store/gaitStore";

import RecoverySection from "../components/home/RecoverySection";
import TelemetrySection from "../components/home/TelemetrySection";
import LengthSection from "../components/home/LengthSection";
import PhysioModules from "../components/home/PhysioSection";
import FootPronationCard from "../components/home/FootPronationCard";
import StepsWideCard from "../components/home/StepsWodeCard";
import GroundContactTimeCard from "../components/home/GroundContactTime";
import PronationIndexCard from "../components/home/PronationIndexCard";
import SymmetryProgressCard from "../components/home/SymmentryProgressCard";
import GaitCycleCard from "../components/home/GaitCycleDistributionCard";

export default function Home() {
  // 1. Local state to prevent infinite re-renders
  const [analytics, setAnalytics] = useState(() => useGaitStore.getState().liveData.analytics);

  // 2. Safely pull new data every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(useGaitStore.getState().liveData.analytics);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // DYNAMIC HOME DATA
  // =====================================================
  const homeData = useMemo(() => ({
    recovery: {
      score: analytics.recoveryScore || 0,
      trend: 12,
      target: 85,
    },
    telemetry: {
      symmetry: Math.round(analytics.symmetry || 0),
      velocity: analytics.velocity || 0,
      asymmetry: Math.round(analytics.asymmetry || 0),
      fallRisk: analytics.fallRisk || "LOW",
    },
    gaitIndex: {
      pronationLeft: Math.round(analytics.pronationLeft || 0),
      pronationRight: Math.round(analytics.pronationRight || 0),
      pronationIndex: Math.round(analytics.pronationIndex || 0),
    },
    groundContact: {
      left: analytics.groundContactLeft || 0,
      right: analytics.groundContactRight || 0,
      unit: "ms",
    },
    stepMetrics: {
      steps: analytics.steps || 0,
      goal: 8000,
    },
    lengthMetrics: {
      stepLeft: analytics.stepLengthLeft || 0,
      stepRight: analytics.stepLengthRight || 0,
      target: 0.5,
      stride: analytics.strideLength || 0,
      strideTarget: 1.2,
      cadence: analytics.cadence || 0,
    },
    physio: [
      { id: 1, name: "Heel Raises", sets: 3, target: "12 reps", completed: true, icon: "🦶" },
      { id: 2, name: "Balance Hold", sets: 2, target: "30 sec", completed: false, icon: "⚖️" },
      { id: 3, name: "Step Ups", sets: 3, target: "10 reps", completed: true, icon: "📈" },
    ],
  }), [analytics]);

  const weeklyProgress = []; 

  const gaitCycleData = useMemo(() => ([
    {
      name: "Left",
      stance: analytics.symmetry || 0,
      swing: 100 - (analytics.symmetry || 0),
    },
    {
      name: "Right",
      stance: 100 - (analytics.asymmetry || 0),
      swing: analytics.asymmetry || 0,
    },
  ]), [analytics]);

  return (
    <div className="bg-[#F2F4F7] flex flex-col pb-32 space-y-4">
      <RecoverySection data={homeData.recovery} />
      <TelemetrySection data={homeData.telemetry} />
      <StepsWideCard data={homeData.stepMetrics} />
      <FootPronationCard data={homeData.gaitIndex} />
      <LengthSection data={homeData.lengthMetrics} />
      <GroundContactTimeCard data={homeData.groundContact} />
      <PronationIndexCard data={homeData.gaitIndex} />
      <SymmetryProgressCard data={weeklyProgress} />
      <GaitCycleCard data={gaitCycleData} />
      <PhysioModules data={homeData.physio} />
    </div>
  );
}