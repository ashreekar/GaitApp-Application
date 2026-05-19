import { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { Battery, BatteryLow, BatteryMedium, Footprints, Activity, Waves } from "lucide-react";
import { PressureHeatmap } from "../components/live/FootHeatmapPanel";
import { useGaitStore } from "../store/gaitStore";

const SENSOR_IDS = ["T1", "T2", "T3", "T4", "T5", "M1", "M2", "M3", "M4", "M5", "MM", "CM", "LM", "MH", "CH", "LH"];

export default function LivePage() {
  const hydrated = useGaitStore((s) => s.hydrated);
  const isConnected = useGaitStore((s) => s.leftConnection === "connected" || s.rightConnection === "connected");
  
  // Track auto-session status for the UI
  const isRecording = useGaitStore((s) => !!s.sessionId);

  const [viewData, setViewData] = useState({ leftPressure: {}, rightPressure: {}, battery: { L: 100, R: 100 }, phase: "STANCE", history: [] });

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      const state = useGaitStore.getState();
      const live = state.liveData;
      setViewData((prev) => {
        const newEntry = {
          displayTime: new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', fractionalSecondDigits: 1 }),
          AVG_L: state.latestAvgL || 0, AVG_R: state.latestAvgR || 0,
        };
        SENSOR_IDS.forEach((id) => {
          newEntry[`${id}_L`] = live.leftPressure[id] || 0;
          newEntry[`${id}_R`] = live.rightPressure[id] || 0;
        });
        return {
          leftPressure: live.leftPressure, rightPressure: live.rightPressure,
          battery: live.battery, phase: live.phase, history: [...prev.history, newEntry].slice(-20),
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
          <p className="text-sm text-slate-500">Please connect your gait modules in settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F3F4F6] pb-28">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-[#F3F4F6]/90 backdrop-blur-xl px-5 pt-6 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Live Session</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time gait monitoring</p>
        </div>
        
        {/* AUTO-RECORDING INDICATOR */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${isRecording ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
          {isRecording ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
          ) : (
             <span className="h-2.5 w-2.5 rounded-full bg-gray-400"></span>
          )}
          {isRecording ? "Recording" : "Idle"}
        </div>
      </div>

      <div className="px-4 space-y-5 mt-2">
        {/* CARDS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[28px] p-5 shadow-sm">
            <div className="text-[11px] uppercase font-bold tracking-wider text-gray-400 mb-4">Battery</div>
            <div className="space-y-4">
              <BatteryRow label="L" value={viewData.battery.L} icon={getBatteryIcon(viewData.battery.L)} />
              <BatteryRow label="R" value={viewData.battery.R} icon={getBatteryIcon(viewData.battery.R)} />
            </div>
          </div>
          <div className="bg-white rounded-[28px] p-5 shadow-sm">
            <div className="text-[11px] uppercase font-bold tracking-wider text-gray-400 mb-4">Active Phase</div>
            <div className="mt-2 text-xl font-bold text-[#111827] leading-tight">{viewData.phase}</div>
            <Footprints size={24} className="text-blue-600 mt-4 opacity-20" />
          </div>
        </div>

        {/* HEATMAP */}
        <div className="bg-white rounded-[32px] p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#111827] mb-5">Pressure Heatmap</h2>
          <div className="flex items-center justify-center gap-2 overflow-hidden">
            <PressureHeatmap side="LEFT" grid={viewData.leftPressure} compact />
            <PressureHeatmap side="RIGHT" grid={viewData.rightPressure} compact />
          </div>
        </div>

        {/* CHARTS */}
        <ChartCard title="Average Pressure"><SensorChart history={viewData.history} keys={["AVG_L", "AVG_R"]} thick /></ChartCard>
        <ChartCard title="Left Sensors"><SensorChart history={viewData.history} keys={SENSOR_IDS.map(id => `${id}_L`)} /></ChartCard>
        <ChartCard title="Right Sensors"><SensorChart history={viewData.history} keys={SENSOR_IDS.map(id => `${id}_R`)} /></ChartCard>
      </div>
    </div>
  );
}

function BatteryRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2"><div className="bg-gray-100 rounded-lg px-2 py-1 text-xs font-bold text-gray-700">{label}</div>{icon}</div>
      <div className="text-sm font-semibold text-[#111827]">{Math.round(value)}%</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-[32px] p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#111827] mb-5">{title}</h2>
      {children}
    </div>
  );
}

function SensorChart({ history, keys, thick = false }) {
  if (history.length === 0) return <div className="h-[260px] flex items-center justify-center text-slate-400">Waiting for data...</div>;
  const series = keys.map(key => ({ data: history.map(d => d[key] ?? 0), label: key, showMark: false, curve: "natural", area: thick, strokeWidth: thick ? 4 : 1.8 }));
  return (
    <div className="w-full h-[260px]">
      <LineChart height={260} xAxis={[{ scaleType: "point", data: history.map(d => d.displayTime) }]} yAxis={[{ min: 0, max: 1024 }]} series={series} slotProps={{ legend: { hidden: true } }} sx={{ "& .MuiLineElement-root": { strokeWidth: thick ? 4 : 2 }, "& .MuiAreaElement-root": { fillOpacity: 0.08 } }} />
    </div>
  );
}