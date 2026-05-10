import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useGaitSimulation } from "../hooks/useGaitSimulation";
import { PressureHeatmap } from "../components/live/FootHeatmapPanel";

const SENSOR_IDS = [
  "T1", "T2", "T3", "T4", "T5",
  "M1", "M2", "M3", "M4", "M5",
  "MM", "CM", "LM",
  "MH", "CH", "LH"
];

export default function LivePage() {

  // PURE REACT JS
  const liveData = useGaitSimulation(true);

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
      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.9)",
          padding: "16px 24px",
          borderBottom: "1px solid #eee",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "red",
            fontWeight: "bold",
          }}
        >
          REC: {(liveData.elapsedTime / 1000).toFixed(1)}s
        </div>
      </header>

      <main style={{ padding: "20px" }}>

        {/* BATTERY + PHASE */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "20px",
            }}
          >
            <h4>Battery</h4>
            <p>Left: {Math.round(liveData.battery.L)}%</p>
            <p>Right: {Math.round(liveData.battery.R)}%</p>
          </div>

          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "20px",
            }}
          >
            <h4>Phase</h4>
            <p>{liveData.phase}</p>
          </div>
        </div>

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
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
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

        {/* ========================= */}
        {/* GRAPH 1 : LEFT FOOT */}
        {/* ========================= */}
        <GraphContainer title="Left Foot - All 16 Sensors">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={liveData.history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayTime" />
              <YAxis domain={[0, 1024]} />
              <Tooltip />
              <Legend />

              {SENSOR_IDS.map((id) => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={`${id}_L`}
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </GraphContainer>

        {/* ========================= */}
        {/* GRAPH 2 : RIGHT FOOT */}
        {/* ========================= */}
        <GraphContainer title="Right Foot - All 16 Sensors">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={liveData.history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayTime" />
              <YAxis domain={[0, 1024]} />
              <Tooltip />
              <Legend />

              {SENSOR_IDS.map((id) => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={`${id}_R`}
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </GraphContainer>

        {/* ========================= */}
        {/* GRAPH 3 : AVG LEFT VS RIGHT */}
        {/* ========================= */}
        <GraphContainer title="Average Pressure Left vs Right">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={liveData.history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayTime" />
              <YAxis domain={[0, 1024]} />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="AVG_L"
                dot={false}
                strokeWidth={4}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="AVG_R"
                dot={false}
                strokeWidth={4}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </GraphContainer>
      </main>
    </div>
  );
}

/* REUSABLE GRAPH BOX */
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