import RecoveryScore from "../components/home/RecoverySection";
import IndexCards from "../components/home/TelemetrySection";
import StepLengthCards from "../components/home/LengthSection";
import PhysioModules from "../components/home/PhysioSection";
import { homeData } from "../lib/homeData";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col pt-safe">
      
      <main className="flex-1 flex flex-col space-y-1 pb-32">
        
        {/* Section 1: Recovery (Hero Section) */}
        <section className="bg-white px-5 pt-8 pb-6 rounded-b-[32px] shadow-sm">
          <RecoveryScore data={homeData.recovery} />
        </section>

        {/* Section 2: Telemetry (The Grid) */}
        <section className="px-4 pt-6">
          <IndexCards data={homeData.telemetry} />
        </section>

        {/* Section 3: Step & Stride (Analysis) */}
        <section className="px-4 pt-4">
          <StepLengthCards data={homeData.lengthMetrics} />
        </section>

        {/* Section 4: Physio Modules (Action Items) */}
        <section className="px-4 pt-6 pb-4">
          <PhysioModules data={homeData.physio} />
        </section>

      </main>
    </div>
  );
}