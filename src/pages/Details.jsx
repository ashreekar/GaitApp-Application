import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Activity, Footprints, Gauge, Waves, Timer } from "lucide-react";
import { LineChart } from "@mui/x-charts/LineChart";
import api from "../lib/axiosinstance";

export default function SessionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const res = await api.get(`/api/v1/session/${id}`);
        setSession(res.data.session);
      } catch (err) {
        console.error("Failed to fetch session details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessionDetails();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading session...</div>;
  if (!session) return <div className="min-h-screen flex items-center justify-center text-red-500">Session not found.</div>;

  const frames = session.frames || [];
  const start = new Date(session.startTime);
  const end = session.endTime ? new Date(session.endTime) : new Date();
  const durationMs = end - start;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  /* =========================================================
     GRAPH DATA (Mapped to Actual FSR Data)
  ========================================================= */
  const timeLabels = frames.map((_, i) => `F${i + 1}`);
  
  // Heel Pressure (LH_L vs LH_R)
  const leftHeelData = frames.map((f) => f.LH_L || 0);
  const rightHeelData = frames.map((f) => f.LH_R || 0);
  
  // Toe Pressure (T1_L vs T1_R)
  const leftToeData = frames.map((f) => f.T1_L || 0);
  const rightToeData = frames.map((f) => f.T1_R || 0);

  return (
    <div className="min-h-[100dvh] bg-[#F3F4F6] pb-32">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Session Details</h1>
            <p className="text-xs text-gray-500">ID: {id?.slice(-8)}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard icon={<Timer size={20} />} title="Duration" value={`${minutes}m ${seconds}s`} />
          <SummaryCard icon={<Footprints size={20} />} title="Frames" value={session.frameCount || 0} />
          <SummaryCard icon={<Activity size={20} />} title="Recorded" value={start.toLocaleDateString()} />
          <SummaryCard icon={<Gauge size={20} />} title="Status" value={session.status} />
        </div>

        {/* SESSION INFO */}
        <SectionCard title="Session Information">
          <InfoRow label="Started" value={start.toLocaleString()} />
          <InfoRow label="Ended" value={session.endTime ? end.toLocaleString() : "In Progress"} />
          <InfoRow label="Session ID" value={session._id} />
        </SectionCard>

        {/* HEEL PRESSURE GRAPH */}
        <GraphCard title="Heel Strike Pressure (LH)">
          <ComparisonChart labels={timeLabels} leftData={leftHeelData} rightData={rightHeelData} />
        </GraphCard>

        {/* TOE PRESSURE GRAPH */}
        <GraphCard title="Toe-Off Pressure (T1)">
          <ComparisonChart labels={timeLabels} leftData={leftToeData} rightData={rightToeData} />
        </GraphCard>

        {/* FRAME EXPLORER */}
        <FrameSearchCard frames={frames} />
      </div>
    </div>
  );
}

/* =========================================================
   COMPARISON CHART (Left vs Right)
========================================================= */
function ComparisonChart({ labels, leftData, rightData }) {
  if (!labels.length) return <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">No frame data available</div>;
  
  return (
    <LineChart
      height={260}
      xAxis={[{ scaleType: "point", data: labels }]}
      yAxis={[{ min: 0, max: 1024 }]}
      series={[
        { data: leftData, label: "Left", showMark: false, curve: "natural", color: "#3B82F6" },
        { data: rightData, label: "Right", showMark: false, curve: "natural", color: "#EF4444" },
      ]}
      slotProps={{ legend: { hidden: false } }}
      sx={{ "& .MuiLineElement-root": { strokeWidth: 3 } }}
    />
  );
}

/* =========================================================
   COMPONENTS
========================================================= */
function SummaryCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm">
      <div className="flex items-center gap-2 text-gray-500 mb-3">{icon} <span className="text-xs font-semibold uppercase">{title}</span></div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-[28px] p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-5">{title}</h2>
      {children}
    </div>
  );
}

function GraphCard({ title, children }) {
  return (
    <div className="bg-white rounded-[28px] p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Waves size={18} className="text-gray-500" />
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-900 text-right max-w-[60%] break-all">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-3">
      <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">{label}</div>
      <div className="font-bold text-gray-900">{value}</div>
    </div>
  );
}

function FrameSearchCard({ frames }) {
  const [query, setQuery] = useState("");
  // Simple search by frame index (1-based)
  const filteredFrames = frames.map((f, i) => ({ ...f, index: i + 1 })).filter(f => f.index.toString().includes(query));

  return (
    <SectionCard title="Raw Frame Explorer">
      <input
        type="text"
        placeholder="Search by frame number..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-gray-100 rounded-2xl px-4 py-4 outline-none text-sm font-medium mb-5 placeholder:text-gray-400"
      />
      {filteredFrames.length === 0 && <div className="py-10 text-center text-sm text-gray-400">No matching frames found</div>}
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {filteredFrames.map((frame) => (
          <div key={frame._id || frame.index} className="bg-gray-50 rounded-3xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-bold text-gray-900">Frame #{frame.index}</div>
                <div className="text-xs text-gray-400 mt-1">TS: {new Date(frame.timestamp).toLocaleTimeString()}</div>
              </div>
              <div className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-gray-600 border shadow-sm uppercase">{frame.phase}</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <MiniStat label="Heel L" value={frame.LH_L} />
              <MiniStat label="Heel R" value={frame.LH_R} />
              <MiniStat label="Toe L" value={frame.T1_L} />
              <MiniStat label="Toe R" value={frame.T1_R} />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}