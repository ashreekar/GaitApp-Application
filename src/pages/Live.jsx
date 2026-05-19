import { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import {
  Battery,
  BatteryLow,
  BatteryMedium,
  Footprints,
  Activity,
  Waves,
} from "lucide-react";
import { PressureHeatmap } from "../components/live/FootHeatmapPanel";
import { useGaitStore } from "../store/gaitStore";

const SENSOR_IDS = [
  "T1", "T2", "T3", "T4", "T5",
  "M1", "M2", "M3", "M4", "M5",
  "MM", "CM", "LM", "MH", "CH", "LH",
];

export default function LivePage() {
  const hydrated = useGaitStore((s) => s.hydrated);
  
  // FIX 1: Check if EITHER left or right is connected
  const isConnected = useGaitStore(
    (s) => s.leftConnection === "connected" || s.rightConnection === "connected"
  );

  // FIX 2: Use local state so we don't crash MUI charts with 20fps re-renders
  const [viewData, setViewData] = useState({
    leftPressure: {},
    rightPressure: {},
    battery: { L: 100, R: 100 },
    phase: "STANCE",
    history: [],
  });

  useEffect(() => {
    if (!isConnected) return;

    // Pull data 10 times a second (100ms). Fast enough for smooth UI, slow enough to not crash.
    const interval = setInterval(() => {
      const state = useGaitStore.getState();
      const live = state.liveData;
      
      setViewData((prev) => {
        // Build a flat history object for the MUI Charts
        const newEntry = {
          displayTime: new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', fractionalSecondDigits: 1 }),
          AVG_L: state.latestAvgL || 0,
          AVG_R: state.latestAvgR || 0,
        };

        SENSOR_IDS.forEach((id) => {
          newEntry[`${id}_L`] = live.leftPressure[id] || 0;
          newEntry[`${id}_R`] = live.rightPressure[id] || 0;
        });

        // Keep only the last 20 frames so the chart doesn't get squished
        const newHistory = [...prev.history, newEntry].slice(-20);

        return {
          leftPressure: live.leftPressure,
          rightPressure: live.rightPressure,
          battery: live.battery,
          phase: live.phase,
          history: newHistory,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isConnected]);

  if (!hydrated) return null;

  const getBatteryIcon = (level) => {
    if (level > 60) return <Battery size={18} className="text-green-500" />;
    if (level > 20) return <BatteryMedium size={18} className="text-amber-500" />;
    return <BatteryLow size={18} className="text-red-500" />;
  };

  if (!isConnected) {
    return (
      <div className="min-h-[100dvh] bg-[#F3F4F6] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 max-w-sm w-full">
          <Activity size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Sensor Linked</h2>
          <p className="text-sm text-slate-500 mb-6">
            Please connect your gait analysis modules in settings to view live telemetry.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F3F4F6] pb-28">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-[#F3F4F6]/90 backdrop-blur-xl px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Live Session</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time gait monitoring</p>
      </div>

      <div className="px-4 space-y-5">
        {/* TOP STATUS CARDS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[28px] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-gray-400">Battery</div>
              </div>
              <div className="bg-[#F3F4F6] rounded-2xl p-3">
                <Activity size={18} className="text-gray-700" />
              </div>
            </div>
            <div className="space-y-4">
              <BatteryRow label="Left" value={viewData.battery.L} icon={getBatteryIcon(viewData.battery.L)} />
              <BatteryRow label="Right" value={viewData.battery.R} icon={getBatteryIcon(viewData.battery.R)} />
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-gray-400">Active Phase</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-3">
                <Footprints size={18} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-xl font-bold text-[#111827] leading-tight">
              {viewData.phase}
            </div>
          </div>
        </div>

        {/* HEATMAP CARD */}
        <div className="bg-white rounded-[32px] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Pressure Heatmap</h2>
            </div>
            <div className="bg-[#F3F4F6] rounded-2xl p-3">
              <Waves size={18} className="text-gray-700" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 overflow-hidden">
            <PressureHeatmap side="LEFT" grid={viewData.leftPressure} compact />
            <PressureHeatmap side="RIGHT" grid={viewData.rightPressure} compact />
          </div>
        </div>

        {/* CHARTS */}
        <ChartCard title="Average Pressure">
          <SensorChart history={viewData.history} keys={["AVG_L", "AVG_R"]} thick />
        </ChartCard>

        <ChartCard title="Left Foot Sensors">
          <SensorChart history={viewData.history} keys={SENSOR_IDS.map((id) => `${id}_L`)} />
        </ChartCard>

        <ChartCard title="Right Foot Sensors">
          <SensorChart history={viewData.history} keys={SENSOR_IDS.map((id) => `${id}_R`)} />
        </ChartCard>
      </div>
    </div>
  );
}

function BatteryRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-700">{label}</div>
        {icon}
      </div>
      <div className="text-sm font-semibold text-[#111827]">{Math.round(value)}%</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-[32px] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-[#111827]">{title}</h2>
        <div className="bg-[#F3F4F6] rounded-2xl p-3">
          <Activity size={18} className="text-gray-700" />
        </div>
      </div>
      {children}
    </div>
  );
}

function SensorChart({ history, keys, thick = false }) {
  if (history.length === 0) return <div className="h-[260px] flex items-center justify-center text-slate-400">Waiting for data...</div>;

  const xLabels = history.map((d) => d.displayTime);
  const series = keys.map((key) => ({
    data: history.map((d) => d[key] ?? 0),
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
        xAxis={[{ scaleType: "point", data: xLabels }]}
        yAxis={[{ min: 0, max: 1024 }]}
        series={series}
        slotProps={{ legend: { hidden: true } }}
        sx={{
          "& .MuiLineElement-root": { strokeWidth: thick ? 4 : 2 },
          "& .MuiAreaElement-root": { fillOpacity: 0.08 },
          "& .MuiChartsAxis-line": { stroke: "#E5E7EB" },
          "& .MuiChartsAxis-tick": { stroke: "#E5E7EB" },
          "& .MuiChartsAxis-tickLabel": { fill: "#9CA3AF", fontSize: 10 },
          "& .MuiChartsGrid-line": { stroke: "#F3F4F6" },
        }}
      />
    </div>
  );
}