import { homeData, weeklyProgress, gaitCycleData } from "../lib/homeData";

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
  return (
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col pb-32 space-y-4">

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