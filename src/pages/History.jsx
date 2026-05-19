import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Clock3, Activity, CalendarDays, Footprints } from "lucide-react";
import api from "../lib/axiosinstance";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/session?page=${page}&limit=6`);
      setSessions(res.data.sessions);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#F3F4F6] pb-32 px-4 pt-5">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-[30px] font-extrabold text-gray-900">Session History</h1>
        <p className="text-sm text-gray-500 mt-1">Review all recorded gait analysis sessions</p>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-gray-400">No sessions recorded yet.</div>
      ) : (
        <>
          {/* SESSION LIST */}
          <div className="space-y-4">
            {sessions.map((session) => (
              <SessionCard key={session._id} session={session} onClick={() => navigate(`/details/${session._id}`)} />
            ))}
          </div>

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={fetchHistory} />
          )}
        </>
      )}
    </div>
  );
}

/* =========================================
   SESSION CARD
========================================= */
function SessionCard({ session, onClick }) {
  const start = new Date(session.startTime);
  const end = session.endTime ? new Date(session.endTime) : new Date();
  const durationMs = end - start;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  return (
    <div onClick={onClick} className="bg-white rounded-[28px] p-5 shadow-sm active:scale-[0.985] transition-all duration-150 cursor-pointer">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Gait Session</h2>
          <p className="text-xs text-gray-400 mt-1">ID: {session._id.slice(-8)}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${session.status === "ended" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          {session.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={<CalendarDays size={18} />} label="Date" value={start.toLocaleDateString()} />
        <MetricCard icon={<Clock3 size={18} />} label="Duration" value={`${minutes}m ${seconds}s`} />
        <MetricCard icon={<Activity size={18} />} label="Started" value={start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
        <MetricCard icon={<Footprints size={18} />} label="Frames" value={session.frameCount || "N/A"} />
      </div>

      <div className="flex items-center justify-between mt-5">
        <p className="text-sm text-gray-500 font-medium">Tap to view analytics</p>
        <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
          <ChevronRight size={18} className="text-gray-800" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}{" "}
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-[15px] font-bold text-gray-900">{value}</div>
    </div>
  );
}

/* =========================================
   PAGINATION
========================================= */
function Pagination({ pagination, onPageChange }) {
  const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
  return (
    <div className="flex justify-center items-center gap-3 mt-8">
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-11 h-11 rounded-2xl text-sm font-bold transition-all duration-200 ${page === pagination.page ? "bg-black text-white" : "bg-white text-gray-900 shadow-sm"}`}
        >
          {page}
        </button>
      ))}
    </div>
  );
}