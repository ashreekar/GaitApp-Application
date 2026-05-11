import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Clock3,
  Activity,
  CalendarDays,
  Footprints,
} from "lucide-react";

/* =========================================
   MOCK API RESPONSE
========================================= */

const sessionResponse = {
  success: true,
  pagination: {
    total: 12,
    page: 1,
    limit: 6,
    totalPages: 2,
  },
  sessions: [
    {
      _id: "6a0018aa13df05af647a6561",
      userId: "69fefb7939292fe6b76654c7",
      startTime: 1778391210287,
      endTime: 1778392084118,
      status: "ended",
      createdAt: "2026-05-10T05:33:30.297Z",
      updatedAt: "2026-05-10T05:48:04.127Z",
    },
    {
      _id: "6a0018aa13df05af647a6562",
      userId: "69fefb7939292fe6b76654c7",
      startTime: 1778394210287,
      endTime: 1778395084118,
      status: "ended",
      createdAt: "2026-05-10T07:33:30.297Z",
      updatedAt: "2026-05-10T07:48:04.127Z",
    },
    {
      _id: "6a0018aa13df05af647a6563",
      userId: "69fefb7939292fe6b76654c7",
      startTime: 1778398210287,
      endTime: 1778399084118,
      status: "ended",
      createdAt: "2026-05-10T09:33:30.297Z",
      updatedAt: "2026-05-10T09:48:04.127Z",
    },
  ],
};

/* =========================================
   PAGE
========================================= */

export default function HistoryPage() {
  const navigate = useNavigate();

  const { sessions, pagination } = sessionResponse;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-32 px-4 pt-5">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-[30px] font-extrabold text-gray-900">
          Session History
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Review all recorded gait analysis sessions
        </p>
      </div>

      {/* SESSION LIST */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <SessionCard
            key={session._id}
            session={session}
            onClick={() => navigate(`/details/${session._id}`)}
          />
        ))}
      </div>

      {/* PAGINATION */}
      <Pagination pagination={pagination} />

    </div>
  );
}

/* =========================================
   SESSION CARD
========================================= */

function SessionCard({ session, onClick }) {

  const start = new Date(session.startTime);
  const end = new Date(session.endTime);

  const durationMs = end - start;

  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  return (
    <div
      onClick={onClick}
      className="
        bg-white
        rounded-[28px]
        p-5
        shadow-sm
        active:scale-[0.985]
        transition-all
        duration-150
      "
    >

      {/* TOP */}
      <div className="flex items-start justify-between mb-5">

        <div>
          <h2 className="text-[18px] font-bold text-gray-900">
            Gait Session
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            ID: {session._id.slice(-8)}
          </p>
        </div>

        <div
          className={`
            px-3 py-1 rounded-full text-[11px] font-bold capitalize
            ${
              session.status === "ended"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }
          `}
        >
          {session.status}
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 gap-3">

        <MetricCard
          icon={<CalendarDays size={18} />}
          label="Date"
          value={start.toLocaleDateString()}
        />

        <MetricCard
          icon={<Clock3 size={18} />}
          label="Duration"
          value={`${minutes}m ${seconds}s`}
        />

        <MetricCard
          icon={<Activity size={18} />}
          label="Started"
          value={start.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        />

        <MetricCard
          icon={<Footprints size={18} />}
          label="Ended"
          value={end.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        />

      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between mt-5">

        <p className="text-sm text-gray-500 font-medium">
          Tap to view analytics
        </p>

        <div
          className="
            w-10 h-10
            rounded-2xl
            bg-gray-100
            flex items-center justify-center
          "
        >
          <ChevronRight size={18} className="text-gray-800" />
        </div>
      </div>
    </div>
  );
}

/* =========================================
   METRIC CARD
========================================= */

function MetricCard({ icon, label, value }) {
  return (
    <div
      className="
        bg-gray-50
        rounded-2xl
        p-3
      "
    >
      <div className="flex items-center gap-2 text-gray-500 mb-2">

        {icon}

        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <div className="text-[15px] font-bold text-gray-900">
        {value}
      </div>
    </div>
  );
}

/* =========================================
   PAGINATION
========================================= */

function Pagination({ pagination }) {

  const pages = Array.from(
    { length: pagination.totalPages },
    (_, i) => i + 1
  );

  return (
    <div className="flex justify-center items-center gap-3 mt-8">

      {pages.map((page) => {

        const active = page === pagination.page;

        return (
          <button
            key={page}
            className={`
              w-11 h-11
              rounded-2xl
              text-sm
              font-bold
              transition-all
              duration-200
              ${
                active
                  ? "bg-black text-white"
                  : "bg-white text-gray-900 shadow-sm"
              }
            `}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
}