import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import {
  ArrowLeft,
  Activity,
  Footprints,
  Gauge,
  Waves,
  Timer,
} from "lucide-react";

import { LineChart } from "@mui/x-charts/LineChart";

/* =========================================================
   MOCK API RESPONSE
========================================================= */

const sessionDetails = {
  success: true,
  session: {
    _id: "6a0018aa13df05af647a6561",
    userId: "69fefb7939292fe6b76654c7",
    startTime: 1778391210287,
    endTime: 1778392084118,
    status: "ended",
    createdAt: "2026-05-10T05:33:30.297Z",
    updatedAt: "2026-05-10T05:48:04.127Z",

    frames: [
      {
        ts: 171000001,
        steps: 245,
        cadence: 78.4,
        activity: "walking",
        impact: 1.85,
        pitch: 12.4,
        roll: -5.7,
        fsrRaw: 2345,
        accel: {
          x: 234,
          y: -189,
          z: 9876,
        },
      },

      {
        ts: 171000201,
        steps: 246,
        cadence: 79.1,
        activity: "walking",
        impact: 1.91,
        pitch: 11.9,
        roll: -4.8,
        fsrRaw: 2401,
        accel: {
          x: 220,
          y: -170,
          z: 9900,
        },
      },

      {
        ts: 171000401,
        steps: 247,
        cadence: 81.2,
        activity: "walking",
        impact: 2.05,
        pitch: 13.1,
        roll: -6.1,
        fsrRaw: 2520,
        accel: {
          x: 280,
          y: -200,
          z: 10050,
        },
      },
    ],

    frameCount: 3,
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function SessionDetails() {

  const navigate = useNavigate();
  const { id } = useParams();

  const session = sessionDetails.session;

  const frames = session.frames;

  const start = new Date(session.startTime);
  const end = new Date(session.endTime);

  const durationMs = end - start;

  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  /* =========================================================
     GRAPH DATA
  ========================================================= */

  const timeLabels = frames.map((_, i) => `F${i + 1}`);

  const cadenceData = frames.map((f) => f.cadence);
  const impactData = frames.map((f) => f.impact);
  const fsrData = frames.map((f) => f.fsrRaw);

  const pitchData = frames.map((f) => f.pitch);
  const rollData = frames.map((f) => f.roll);

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-32">

      {/* HEADER */}

      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">

        <div className="px-4 py-4 flex items-center gap-3">

          <button
            onClick={() => navigate(-1)}
            className="
              w-10 h-10
              rounded-2xl
              bg-gray-100
              flex items-center justify-center
            "
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Session Details
            </h1>

            <p className="text-xs text-gray-500">
              ID: {id?.slice(-8)}
            </p>
          </div>

        </div>
      </div>

      <div className="p-4 space-y-5">

        {/* SUMMARY */}

        <div className="grid grid-cols-2 gap-4">

          <SummaryCard
            icon={<Timer size={20} />}
            title="Duration"
            value={`${minutes}m ${seconds}s`}
          />

          <SummaryCard
            icon={<Footprints size={20} />}
            title="Frames"
            value={session.frameCount}
          />

          <SummaryCard
            icon={<Activity size={20} />}
            title="Activity"
            value={frames[0]?.activity || "N/A"}
          />

          <SummaryCard
            icon={<Gauge size={20} />}
            title="Status"
            value={session.status}
          />

        </div>

        {/* SESSION INFO */}

        <SectionCard title="Session Information">

          <InfoRow
            label="Started"
            value={start.toLocaleString()}
          />

          <InfoRow
            label="Ended"
            value={end.toLocaleString()}
          />

          <InfoRow
            label="Session ID"
            value={session._id}
          />

          <InfoRow
            label="User ID"
            value={session.userId}
          />

        </SectionCard>

        {/* CADENCE GRAPH */}

        <GraphCard title="Cadence Analysis">

          <FilledChart
            labels={timeLabels}
            data={cadenceData}
            label="Cadence"
          />

        </GraphCard>

        {/* IMPACT GRAPH */}

        <GraphCard title="Impact Force">

          <FilledChart
            labels={timeLabels}
            data={impactData}
            label="Impact"
          />

        </GraphCard>

        {/* FSR GRAPH */}

        <GraphCard title="Pressure Sensor (FSR)">

          <FilledChart
            labels={timeLabels}
            data={fsrData}
            label="FSR"
          />

        </GraphCard>

        {/* FOOT ORIENTATION */}

        <GraphCard title="Foot Orientation">

          <LineChart
            height={260}
            xAxis={[
              {
                scaleType: "point",
                data: timeLabels,
              },
            ]}
            series={[
              {
                data: pitchData,
                label: "Pitch",
                showMark: false,
                curve: "natural",
              },
              {
                data: rollData,
                label: "Roll",
                showMark: false,
                curve: "natural",
              },
            ]}
            slotProps={{
              legend: {
                hidden: false,
              },
            }}
            sx={{
              "& .MuiLineElement-root": {
                strokeWidth: 3,
              },
            }}
          />

        </GraphCard>

        {/* FRAME SEARCH */}
        <FrameSearchCard frames={frames} />
      </div>
    </div>
  );
}

/* =========================================================
   FILLED GRAPH
========================================================= */

function FilledChart({ labels, data, label }) {
  return (
    <LineChart
      height={260}
      xAxis={[
        {
          scaleType: "point",
          data: labels,
        },
      ]}
      series={[
        {
          data,
          label,
          area: true,
          showMark: false,
          curve: "natural",
        },
      ]}
      slotProps={{
        legend: {
          hidden: true,
        },
      }}
      sx={{
        "& .MuiAreaElement-root": {
          fillOpacity: 0.15,
        },

        "& .MuiLineElement-root": {
          strokeWidth: 3,
        },
      }}
    />
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({ icon, title, value }) {
  return (
    <div
      className="
        bg-white
        rounded-3xl
        p-4
        shadow-sm
      "
    >
      <div className="flex items-center gap-2 text-gray-500 mb-3">
        {icon}

        <span className="text-xs font-semibold uppercase">
          {title}
        </span>
      </div>

      <div className="text-xl font-bold text-gray-900">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({ title, children }) {
  return (
    <div
      className="
        bg-white
        rounded-[28px]
        p-5
        shadow-sm
      "
    >

      <h2 className="text-lg font-bold text-gray-900 mb-5">
        {title}
      </h2>

      {children}

    </div>
  );
}

/* =========================================================
   GRAPH CARD
========================================================= */

function GraphCard({ title, children }) {
  return (
    <div
      className="
        bg-white
        rounded-[28px]
        p-4
        shadow-sm
      "
    >

      <div className="flex items-center gap-2 mb-4">

        <Waves size={18} className="text-gray-500" />

        <h2 className="text-lg font-bold text-gray-900">
          {title}
        </h2>

      </div>

      {children}

    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b border-gray-100">

      <div className="text-sm text-gray-500">
        {label}
      </div>

      <div className="text-sm font-semibold text-gray-900 text-right max-w-[60%] break-all">
        {value}
      </div>

    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-3">

      <div className="text-xs text-gray-400 mb-1 uppercase">
        {label}
      </div>

      <div className="font-bold text-gray-900">
        {value}
      </div>

    </div>
  );
}

/* =========================================================
   ACCEL CARD
========================================================= */

function AccelCard({ axis, value }) {
  return (
    <div
      className="
        bg-white
        rounded-xl
        p-3
        text-center
      "
    >

      <div className="text-xs text-gray-400 mb-1">
        {axis}
      </div>

      <div className="font-bold text-gray-900">
        {value}
      </div>

    </div>
  );
}

function FrameSearchCard({ frames }) {

  const [query, setQuery] = React.useState("");

  const filteredFrames = frames.filter((frame) =>
    frame.steps.toString().includes(query)
  );

  return (
    <SectionCard title="Frame Explorer">

      {/* SEARCH */}

      <div className="mb-5">

        <input
          type="text"
          placeholder="Search by step number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full
            bg-gray-100
            rounded-2xl
            px-4
            py-4
            outline-none
            text-sm
            font-medium
            placeholder:text-gray-400
          "
        />

      </div>

      {/* EMPTY */}

      {filteredFrames.length === 0 && (
        <div
          className="
            py-10
            text-center
            text-sm
            text-gray-400
          "
        >
          No matching frames found
        </div>
      )}

      {/* RESULTS */}

      <div className="space-y-4">

        {filteredFrames.map((frame, index) => (
          <div
            key={index}
            className="
              bg-gray-50
              rounded-3xl
              p-4
            "
          >

            {/* HEADER */}

            <div className="flex items-center justify-between mb-4">

              <div>

                <div className="text-lg font-bold text-gray-900">
                  Step #{frame.steps}
                </div>

                <div className="text-xs text-gray-400 mt-1">
                  Timestamp: {frame.ts}
                </div>

              </div>

              <div
                className="
                  px-3
                  py-1
                  rounded-full
                  bg-white
                  text-xs
                  font-semibold
                  text-gray-600
                "
              >
                {frame.activity}
              </div>

            </div>

            {/* METRICS */}

            <div className="grid grid-cols-2 gap-3">

              <MiniStat
                label="Cadence"
                value={frame.cadence}
              />

              <MiniStat
                label="Impact"
                value={frame.impact}
              />

              <MiniStat
                label="Pitch"
                value={frame.pitch}
              />

              <MiniStat
                label="Roll"
                value={frame.roll}
              />

              <MiniStat
                label="FSR"
                value={frame.fsrRaw}
              />

            </div>

            {/* ACCEL */}

            <div className="mt-5">

              <div className="text-xs font-semibold text-gray-400 uppercase mb-3">
                Accelerometer
              </div>

              <div className="grid grid-cols-3 gap-3">

                <AccelCard
                  axis="X"
                  value={frame.accel.x}
                />

                <AccelCard
                  axis="Y"
                  value={frame.accel.y}
                />

                <AccelCard
                  axis="Z"
                  value={frame.accel.z}
                />

              </div>

            </div>

          </div>
        ))}

      </div>

    </SectionCard>
  );
}