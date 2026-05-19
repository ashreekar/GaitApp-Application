import { useMemo } from "react";
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
  const analytics = useGaitStore((s) => s.liveData.analytics);

  // =====================================================
  // DYNAMIC HOME DATA (Memoized to prevent child re-renders)
  // =====================================================
  const homeData = useMemo(() => ({
    recovery: {
      score: analytics.recoveryScore,
      trend: 12,
      target: 85,
    },
    telemetry: {
      symmetry: Math.round(analytics.symmetry),
      velocity: analytics.velocity,
      asymmetry: Math.round(analytics.asymmetry),
      fallRisk: analytics.fallRisk,
    },
    gaitIndex: {
      pronationLeft: Math.round(analytics.pronationLeft),
      pronationRight: Math.round(analytics.pronationRight),
      pronationIndex: Math.round(analytics.pronationIndex),
    },
    groundContact: {
      left: analytics.groundContactLeft,
      right: analytics.groundContactRight,
      unit: "ms",
    },
    stepMetrics: {
      steps: analytics.steps,
      goal: 8000,
    },
    lengthMetrics: {
      stepLeft: analytics.stepLengthLeft,
      stepRight: analytics.stepLengthRight,
      target: 0.5,
      stride: analytics.strideLength,
      strideTarget: 1.2,
      cadence: analytics.cadence,
    },
    physio: [
      { id: 1, name: "Heel Raises", sets: 3, target: "12 reps", completed: true, icon: "🦶" },
      { id: 2, name: "Balance Hold", sets: 2, target: "30 sec", completed: false, icon: "⚖️" },
      { id: 3, name: "Step Ups", sets: 3, target: "10 reps", completed: true, icon: "📈" },
    ],
  }), [analytics]);

  const weeklyProgress = []; // Temporarily empty since history usage was commented out

  // =====================================================
  // GAIT CYCLE
  // =====================================================
  const gaitCycleData = useMemo(() => ([
    {
      name: "Left",
      stance: analytics.symmetry,
      swing: 100 - analytics.symmetry,
    },
    {
      name: "Right",
      stance: 100 - analytics.asymmetry,
      swing: analytics.asymmetry,
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