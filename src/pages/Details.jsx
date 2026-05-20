import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Activity, Footprints, Gauge, Waves, Timer, Move3d } from "lucide-react";
import { LineChart } from "@mui/x-charts/LineChart";
import api from "../lib/axiosinstance";

export default function SessionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [session, setSession] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        let url = `/api/v1/session/${id}?page=${page}&limit=60`;
        if (searchQuery) url += `&frame=${searchQuery}`;

        const res = await api.get(url);
        setSession(res.data.session);
        setPagination(res.data.pagination);
        
        if (res.data.pagination && res.data.pagination.page !== page) {
          setPage(res.data.pagination.page);
        }

      } catch (err) {
        console.error("Failed to fetch session details:", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [id, page, searchQuery]);

  if (!session && loading) return <div className="min-h-[100dvh] flex items-center justify-center text-gray-400">Loading session...</div>;
  if (!session) return <div className="min-h-[100dvh] flex items-center justify-center text-red-500">Session not found.</div>;

  const frames = session.frames || [];
  const stats = session.overallStats || {}; // <-- NEW: Grabbing aggregated stats
  
  const start = new Date(session.startTime);
  const end = session.endTime ? new Date(session.endTime) : new Date();
  const durationMs = end - start;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  /* =========================================================
     GRAPH DATA (Current Page frames)
  ========================================================= */
  const chartLabels = frames.map((f) => `F${f.index || "?"}`);
  const leftHeelData = frames.map((f) => f.LH_L || 0);
  const rightHeelData = frames.map((f) => f.LH_R || 0);
  const leftToeData = frames.map((f) => f.T1_L || 0);
  const rightToeData = frames.map((f) => f.T1_R || 0);

  return (
    <div className="min-h-[100dvh] bg-[#F3F4F6] pb-32">
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
        
        {/* =====================================================
            NEW: OVERALL SESSION STATISTICS GRID
        ===================================================== */}
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard icon={<Timer size={20} />} title="Duration" value={`${minutes}m ${seconds}s`} />
          <SummaryCard icon={<Footprints size={20} />} title="Total Steps" value={stats.totalSteps || 0} />
          <SummaryCard icon={<Activity size={20} />} title="Avg Cadence" value={`${stats.avgCadence || 0} spm`} />
          <SummaryCard icon={<Gauge size={20} />} title="Avg FSR" value={stats.avgFsrRaw || 0} />
          <SummaryCard icon={<Move3d size={20} />} title="Avg Pitch" value={`${stats.avgPitch || 0}°`} />
          <SummaryCard icon={<Move3d size={20} />} title="Avg Roll" value={`${stats.avgRoll || 0}°`} />
        </div>

        <SectionCard title="Session Information">
          <InfoRow label="Started" value={start.toLocaleString()} />
          <InfoRow label="Ended" value={session.endTime ? end.toLocaleString() : "In Progress"} />
          <InfoRow label="Total Frames" value={session.frameCount || 0} />
          <InfoRow label="Status" value={<span className="capitalize">{session.status}</span>} />
        </SectionCard>

        {/* GRAPHS */}
        <div className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
          <GraphCard title="Heel Strike Pressure (LH)">
            <ComparisonChart labels={chartLabels} leftData={leftHeelData} rightData={rightHeelData} />
          </GraphCard>

          <div className="mt-5" />

          <GraphCard title="Toe-Off Pressure (T1)">
            <ComparisonChart labels={chartLabels} leftData={leftToeData} rightData={rightToeData} />
          </GraphCard>
        </div>

        {/* SERVER PAGINATED FRAME EXPLORER */}
        <FrameSearchCard 
          frames={frames} 
          searchQuery={searchQuery}
          setSearchQuery={(val) => { setSearchQuery(val); setPage(1); }}
          page={page}
          setPage={setPage}
          pagination={pagination}
          loading={loading}
        />
      </div>
    </div>
  );
}

/* =========================================================
   COMPARISON CHART (Left vs Right)
========================================================= */
function ComparisonChart({ labels, leftData, rightData }) {
  if (!labels || labels.length === 0) return <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">No frame data available</div>;
  
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
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 text-gray-500 mb-3">
        {icon} 
        <span className="text-[11px] font-bold tracking-wider uppercase">{title}</span>
      </div>
      <div className="text-xl font-black text-gray-900">{value}</div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100">
      <h2 className="text-lg font-bold text-gray-900 mb-5">{title}</h2>
      {children}
    </div>
  );
}

function GraphCard({ title, children }) {
  return (
    <div className="bg-white rounded-[28px] p-4 shadow-sm border border-slate-100">
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
    <div className="bg-white rounded-xl p-3 border border-slate-100">
      <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">{label}</div>
      <div className="font-bold text-gray-900">{value}</div>
    </div>
  );
}

function FrameSearchCard({ frames, searchQuery, setSearchQuery, page, setPage, pagination, loading }) {
  return (
    <SectionCard title="Raw Frame Explorer">
      <input
        type="number"
        placeholder="Jump to specific frame number..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none text-sm font-medium mb-5 placeholder:text-gray-400"
      />
      
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading frames...</div>
      ) : frames.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No frames found</div>
      ) : (
        <div className="space-y-4">
          {frames.map((frame) => {
            const { _id, sessionId, timestamp, phase, side_updated, index, createdAt, updatedAt, __v, accel, pitch, roll, steps, cadence, fsrRaw, activity, ...sensors } = frame;

            return (
              <div key={_id} className="bg-gray-50 rounded-3xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-lg font-bold text-gray-900">Frame #{index}</div>
                    <div className="text-xs text-gray-400 mt-1">TS: {new Date(timestamp).toLocaleTimeString()}</div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-gray-600 border shadow-sm uppercase">
                    {phase || "N/A"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <MiniStat label="Pitch" value={pitch?.toFixed(1) || "-"} />
                  <MiniStat label="Roll" value={roll?.toFixed(1) || "-"} />
                  <MiniStat label="Accel Z" value={accel?.z || "-"} />
                </div>

                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pressure Sensors</div>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(sensors).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                      <div className="text-[9px] text-gray-400">{key}</div>
                      <div className="text-xs font-bold text-gray-800">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SERVER PAGINATION CONTROLS */}
      {pagination && pagination.totalPages > 1 && !searchQuery && (
        <div className="flex justify-between items-center mt-6 pt-5 border-t border-gray-100">
          <button 
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl disabled:opacity-30 font-semibold text-sm transition-all active:scale-95"
          >
            Previous
          </button>
          
          <span className="text-sm font-bold text-gray-400">
            {page} <span className="font-normal mx-1">of</span> {pagination.totalPages}
          </span>
          
          <button 
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl disabled:opacity-30 font-semibold text-sm transition-all active:scale-95"
          >
            Next
          </button>
        </div>
      )}
    </SectionCard>
  );
}