import {
  LineChart
} from "@mui/x-charts/LineChart";
import { useGaitSimulation } from "../hooks/useGaitSimulation";
import { PressureHeatmap } from "../components/live/FootHeatmapPanel";
import { Battery, BatteryLow, BatteryMedium, Footprints, Timer } from "lucide-react";

const SENSOR_IDS = [
  "T1", "T2", "T3", "T4", "T5",
  "M1", "M2", "M3", "M4", "M5",
  "MM", "CM", "LM",
  "MH", "CH", "LH"
];

export default function LivePage() {

  const liveData = useGaitSimulation(true);

  const getBatteryIcon = (level) => {
    if (level > 60) return <Battery size={20} color="#22c55e" />;
    if (level > 20) return <BatteryMedium size={20} color="#f59e0b" />;
    return <BatteryLow size={20} color="#ef4444" />;
  };

  return (
    <div
      style={{
        background: "#f8f9fa",
        minHeight: "100vh",
        paddingBottom: "40px",
        fontFamily: "sans-serif",
        color: "#202124",
      }}
    >
      <main style={{ padding: "20px", backgroundColor: "#f9fafb" }}>
        {/* BATTERY + PHASE GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px"
          }}
        >
          {/* Battery Card */}
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#666" }}>Battery</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "600" }}>L</span>
                {getBatteryIcon(liveData.battery.L)}
                <span style={{ fontSize: "13px" }}>{Math.round(liveData.battery.L)}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "600" }}>R</span>
                {getBatteryIcon(liveData.battery.R)}
                <span style={{ fontSize: "13px" }}>{Math.round(liveData.battery.R)}%</span>
              </div>
            </div>
          </div>

          {/* Phase Card */}
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#666" }}>Active Phase</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  background: liveData.phase.includes("Stance") ? "#eff6ff" : "#f3f4f6",
                  padding: "8px",
                  borderRadius: "12px"
                }}
              >
                <Footprints
                  size={24}
                  color={liveData.phase.includes("Left") ? "#3b82f6" : liveData.phase.includes("Right") ? "#8b5cf6" : "#9ca3af"}
                />
              </div>
              <div style={{ lineHeight: "1.2" }}>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#111827" }}>
                  {liveData.phase}
                </div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>Gait Cycle</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <main style={{ padding: "20px" }}>
        {/* HEATMAPS */}
        <div
          style={{
            background: "white",
            borderRadius: "30px",
            padding: "30px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <PressureHeatmap
              side="LEFT"
              grid={liveData.leftPressure}
            />

            <PressureHeatmap
              side="RIGHT"
              grid={liveData.rightPressure}
            />
          </div>
        </div>

        {/* LEFT FOOT */}
        <GraphContainer title="Left Foot - All 16 Sensors">
          <SensorChart
            history={liveData.history}
            keys={SENSOR_IDS.map((id) => `${id}_L`)}
          />
        </GraphContainer>

        {/* RIGHT FOOT */}
        <GraphContainer title="Right Foot - All 16 Sensors">
          <SensorChart
            history={liveData.history}
            keys={SENSOR_IDS.map((id) => `${id}_R`)}
          />
        </GraphContainer>

        {/* AVG */}
        <GraphContainer title="Average Pressure Left vs Right">
          <SensorChart
            history={liveData.history}
            keys={["AVG_L", "AVG_R"]}
            thick
          />
        </GraphContainer>

      </main>
    </div>
  );
}

/* ============================= */
/* SENSOR CHART */
/* ============================= */

function SensorChart({ history, keys, thick = false }) {

  const xLabels = history.map((d) => d.displayTime);

  const series = keys.map((key) => ({
    data: history.map((d) => d[key]),
    label: key,
    showMark: false,
    curve: "linear",
    strokeWidth: thick ? 4 : 2,
  }));

  return (
    <div style={{ width: "100%", height: 350 }}>
      <LineChart
        xAxis={[
          {
            scaleType: "point",
            data: xLabels,
            label: "Time",
          },
        ]}
        yAxis={[
          {
            min: 0,
            max: 1024,
          },
        ]}
        slotProps={{
          legend: {
            hidden: true,
          },
        }}
        series={series}
        height={350}
      />
    </div>
  );
}

/* ============================= */
/* REUSABLE GRAPH BOX */
/* ============================= */

function GraphContainer({ title, children }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "24px",
        padding: "20px",
        marginBottom: "30px",
      }}
    >
      <h3 style={{ marginBottom: "20px" }}>{title}</h3>
      {children}
    </div>
  );
}