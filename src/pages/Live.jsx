import { LineChart } from "@mui/x-charts/LineChart";
import {
  Battery,
  BatteryLow,
  BatteryMedium,
  Footprints,
  Activity,
  Waves,
} from "lucide-react";

import { useGaitSimulation } from "../hooks/useGaitSimulation";
import { PressureHeatmap } from "../components/live/FootHeatmapPanel";
import { useGaitStore, SENSOR_KEYS } from "../store/gaitStore";

const SENSOR_IDS = [
  "T1", "T2", "T3", "T4", "T5",
  "M1", "M2", "M3", "M4", "M5",
  "MM", "CM", "LM",
  "MH", "CH", "LH",
];

export default function LivePage() {

  // const liveData = useGaitSimulation(true);
  const {liveData, isConnected} = useGaitStore((state) => state.liveData);

  const getBatteryIcon = (level) => {
    if (level > 60) {
      return <Battery size={18} className="text-green-500" />;
    }

    if (level > 20) {
      return <BatteryMedium size={18} className="text-amber-500" />;
    }

    return <BatteryLow size={18} className="text-red-500" />;
  };

  // ... (keep getBatteryIcon)

  // 1. If not connected at all
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 max-w-sm w-full">
          <Activity size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Sensor Linked</h2>
          <p className="text-sm text-slate-500 mb-6">
            Please connect your gait analysis module in settings to view live telemetry.
          </p>
          {/* If you are using react-router-dom, you could wrap a button in a <Link to="/settings"> here */}
        </div>
      </div>
    );
  }

  // 2. If connected, but waiting for the first burst of data
  if (!liveData.history || liveData.history.length === 0) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center">
        <Waves size={32} className="text-blue-500 animate-pulse mb-3" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          Syncing Data Stream...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-28">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sticky top-0 z-40 bg-[#F3F4F6]/90 backdrop-blur-xl px-5 pt-6 pb-4">

        <h1 className="text-2xl font-bold text-[#111827]">
          Live Session
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Real-time gait monitoring
        </p>

      </div>

      {/* =====================================================
          BODY
      ===================================================== */}

      <div className="px-4 space-y-5">

        {/* =====================================================
            TOP STATUS CARDS
        ===================================================== */}

        <div className="grid grid-cols-2 gap-4">

          {/* BATTERY */}

          <div className="bg-white rounded-[28px] p-5 shadow-sm">

            <div className="flex items-center justify-between mb-5">

              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-gray-400">
                  Battery
                </div>

                <div className="text-sm text-gray-500 mt-1">
                  Insoles
                </div>
              </div>

              <div className="bg-[#F3F4F6] rounded-2xl p-3">
                <Activity size={18} className="text-gray-700" />
              </div>

            </div>

            <div className="space-y-4">

              <BatteryRow
                label="Left"
                value={liveData.battery.L}
                icon={getBatteryIcon(liveData.battery.L)}
              />

              <BatteryRow
                label="Right"
                value={liveData.battery.R}
                icon={getBatteryIcon(liveData.battery.R)}
              />

            </div>

          </div>

          {/* ACTIVE PHASE */}

          <div className="bg-white rounded-[28px] p-5 shadow-sm">

            <div className="flex items-center justify-between mb-5">

              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-gray-400">
                  Active Phase
                </div>

                <div className="text-sm text-gray-500 mt-1">
                  Gait cycle
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-3">
                <Footprints
                  size={18}
                  className="text-blue-600"
                />
              </div>

            </div>

            <div className="mt-2">

              <div className="text-xl font-bold text-[#111827] leading-tight">
                {liveData.phase}
              </div>
            </div>

          </div>

        </div>

        {/* =====================================================
            HEATMAP CARD
        ===================================================== */}

        <div className="bg-white rounded-[32px] p-5 shadow-sm">

          <div className="flex items-center justify-between mb-5">

            <div>

              <h2 className="text-lg font-bold text-[#111827]">
                Pressure Heatmap
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Real-time plantar pressure
              </p>

            </div>

            <div className="bg-[#F3F4F6] rounded-2xl p-3">
              <Waves size={18} className="text-gray-700" />
            </div>

          </div>

          {/* MOBILE FRIENDLY */}

          <div className="flex items-center justify-center gap-2 overflow-hidden">

            <PressureHeatmap
              side="LEFT"
              grid={liveData.leftPressure}
              compact
            />

            <PressureHeatmap
              side="RIGHT"
              grid={liveData.rightPressure}
              compact
            />

          </div>

        </div>

        {/* =====================================================
            LEFT FOOT CHART
        ===================================================== */}

        <ChartCard title="Left Foot Sensors">

          <SensorChart
            history={liveData.history}
            keys={SENSOR_IDS.map((id) => `${id}_L`)}
          />

        </ChartCard>

        {/* =====================================================
            RIGHT FOOT CHART
        ===================================================== */}

        <ChartCard title="Right Foot Sensors">

          <SensorChart
            history={liveData.history}
            keys={SENSOR_IDS.map((id) => `${id}_R`)}
          />

        </ChartCard>

        {/* =====================================================
            AVERAGE PRESSURE
        ===================================================== */}

        <ChartCard title="Average Pressure">

          <SensorChart
            history={liveData.history}
            keys={["AVG_L", "AVG_R"]}
            thick
          />

        </ChartCard>

      </div>
    </div>
  );
}

/* =========================================================
   BATTERY ROW
========================================================= */

function BatteryRow({
  label,
  value,
  icon,
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="bg-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-700">
          {label}
        </div>

        {icon}

      </div>

      <div className="text-sm font-semibold text-[#111827]">
        {Math.round(value)}%
      </div>

    </div>
  );
}

/* =========================================================
   CHART CARD
========================================================= */

function ChartCard({
  title,
  children,
}) {
  return (
    <div className="bg-white rounded-[32px] p-5 shadow-sm">

      <div className="flex items-center justify-between mb-5">

        <div>

          <h2 className="text-lg font-bold text-[#111827]">
            {title}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Live sensor analytics
          </p>

        </div>

        <div className="bg-[#F3F4F6] rounded-2xl p-3">
          <Activity size={18} className="text-gray-700" />
        </div>

      </div>

      {children}

    </div>
  );
}

/* =========================================================
   SENSOR CHART
========================================================= */

function SensorChart({
  history,
  keys,
  thick = false,
}) {

  const xLabels = history.map((d) => d.displayTime);

  const series = keys.map((key, index) => ({
    data: history.map((d) => d[key]),

    label: key,

    showMark: false,

    curve: "natural",

    area: thick,

    strokeWidth: thick ? 4 : 1.8,
  }));

  return (
    <div className="w-full h-[260px]">

      <LineChart
        height={260}
        xAxis={[
          {
            scaleType: "point",
            data: xLabels,
          },
        ]}
        yAxis={[
          {
            min: 0,
            max: 1024,
          },
        ]}
        series={series}
        slotProps={{
          legend: {
            hidden: true,
          },
        }}
        sx={{
          "& .MuiLineElement-root": {
            strokeWidth: thick ? 4 : 2,
          },

          "& .MuiAreaElement-root": {
            fillOpacity: 0.08,
          },

          "& .MuiChartsAxis-line": {
            stroke: "#E5E7EB",
          },

          "& .MuiChartsAxis-tick": {
            stroke: "#E5E7EB",
          },

          "& .MuiChartsAxis-tickLabel": {
            fill: "#9CA3AF",
            fontSize: 10,
          },

          "& .MuiChartsGrid-line": {
            stroke: "#F3F4F6",
          },
        }}
      />

    </div>
  );
}