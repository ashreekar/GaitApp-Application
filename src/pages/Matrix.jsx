import { useMemo, useState } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  Activity,
  Footprints,
  Waves,
  Gauge,
  TrendingUp,
} from "lucide-react";

/* =========================================================
   MOCK API RESPONSE
========================================================= */

const analyticsResponse = {
  success: true,

  pagination: {
    total: 4,
    page: 1,
    limit: 10,
    totalPages: 1,
  },

  sessions: [
    {
      _id: "1",

      status: "ended",

      latestFrame: {
        steps: 246,
        cadence: 79.1,
        activity: "walking",
        impact: 1.91,
        fsrRaw: 2401,
      },
    },

    {
      _id: "2",

      status: "ended",

      latestFrame: {
        steps: 512,
        cadence: 85.3,
        activity: "walking",
        impact: 2.2,
        fsrRaw: 2650,
      },
    },

    {
      _id: "3",

      status: "ended",

      latestFrame: {
        steps: 760,
        cadence: 91.5,
        activity: "running",
        impact: 2.9,
        fsrRaw: 3100,
      },
    },

    {
      _id: "4",

      status: "ended",

      latestFrame: {
        steps: 1040,
        cadence: 95.2,
        activity: "running",
        impact: 3.3,
        fsrRaw: 3520,
      },
    },
  ],
};

/* =========================================================
   PAGE
========================================================= */

export default function MetricsPage() {
  const [range, setRange] = useState("7D");

  const sessions = analyticsResponse.sessions;

  /* =========================================================
     OVERVIEW STATS
  ========================================================= */

  const overview = useMemo(() => {
    const totalSteps = sessions.reduce(
      (sum, s) => sum + s.latestFrame.steps,
      0
    );

    const avgCadence =
      sessions.reduce(
        (sum, s) => sum + s.latestFrame.cadence,
        0
      ) / sessions.length;

    const avgImpact =
      sessions.reduce(
        (sum, s) => sum + s.latestFrame.impact,
        0
      ) / sessions.length;

    const avgPressure =
      sessions.reduce(
        (sum, s) => sum + s.latestFrame.fsrRaw,
        0
      ) / sessions.length;

    return {
      totalSteps,
      avgCadence,
      avgImpact,
      avgPressure,
      sessions: sessions.length,
    };
  }, [sessions]);

  /* =========================================================
     CHART DATA
  ========================================================= */

  const chartData = sessions.map((session, index) => ({
    day: `D${index + 1}`,

    cadence: session.latestFrame.cadence,

    impact: session.latestFrame.impact,

    pressure: session.latestFrame.fsrRaw,

    steps: session.latestFrame.steps,
  }));

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-28">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sticky top-0 z-40 bg-[#F3F4F6]/90 backdrop-blur-xl px-5 pt-6 pb-4">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Metrics
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Gait recovery analytics
            </p>
          </div>

          <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
            <div className="text-[10px] uppercase font-bold text-gray-400">
              Sessions
            </div>

            <div className="text-lg font-bold text-gray-900">
              {overview.sessions}
            </div>
          </div>

        </div>

        {/* FILTERS */}

        <div className="flex gap-2 mt-5">

          {["7D", "30D", "90D"].map((item) => (
            <button
              key={item}
              onClick={() => setRange(item)}
              className={`
                px-4 py-2 rounded-2xl text-sm font-semibold transition-all
                ${
                  range === item
                    ? "bg-black text-white"
                    : "bg-white text-gray-500"
                }
              `}
            >
              {item}
            </button>
          ))}

        </div>
      </div>

      {/* =====================================================
          BODY
      ===================================================== */}

      <div className="px-4 space-y-5">

        {/* =====================================================
            OVERVIEW CARDS
        ===================================================== */}

        <div className="grid grid-cols-2 gap-4">

          <MetricCard
            title="Total Steps"
            value={overview.totalSteps.toLocaleString()}
            icon={<Footprints size={18} />}
            subtitle="Across sessions"
          />

          <MetricCard
            title="Avg Cadence"
            value={overview.avgCadence.toFixed(1)}
            suffix="spm"
            icon={<Gauge size={18} />}
            subtitle="Walking rhythm"
          />

          <MetricCard
            title="Impact"
            value={overview.avgImpact.toFixed(2)}
            suffix="g"
            icon={<Waves size={18} />}
            subtitle="Foot strike"
          />

          <MetricCard
            title="Pressure"
            value={Math.round(overview.avgPressure)}
            icon={<Activity size={18} />}
            subtitle="FSR average"
          />

        </div>

        {/* =====================================================
            CADENCE TREND
        ===================================================== */}

        <AnalyticsCard
          title="Cadence Trend"
          subtitle="Walking rhythm progression"
        >

          <div className="h-56 mt-5">

            <ResponsiveContainer width="100%" height="100%">

              <AreaChart data={chartData}>

                <defs>

                  <linearGradient
                    id="cadenceFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2563EB"
                      stopOpacity={0.35}
                    />

                    <stop
                      offset="100%"
                      stopColor="#2563EB"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#ECEFF3"
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#9CA3AF",
                    fontSize: 11,
                  }}
                />

                <YAxis hide />

                <Tooltip
                  contentStyle={{
                    border: "none",
                    borderRadius: "16px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="cadence"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fill="url(#cadenceFill)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </AnalyticsCard>

        {/* =====================================================
            IMPACT ANALYSIS
        ===================================================== */}

        <AnalyticsCard
          title="Impact Analysis"
          subtitle="Foot strike intensity"
        >

          <div className="h-52 mt-5">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#ECEFF3"
                />

                <XAxis hide />
                <YAxis hide />

                <Tooltip
                  contentStyle={{
                    border: "none",
                    borderRadius: "16px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="impact"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={false}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </AnalyticsCard>

        {/* =====================================================
            PRESSURE DISTRIBUTION
        ===================================================== */}

        <AnalyticsCard
          title="Pressure Load"
          subtitle="FSR pressure response"
        >

          <div className="h-52 mt-5">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#ECEFF3"
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#9CA3AF",
                    fontSize: 11,
                  }}
                />

                <YAxis hide />

                <Tooltip
                  contentStyle={{
                    border: "none",
                    borderRadius: "16px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                />

                <Bar
                  dataKey="pressure"
                  fill="#10B981"
                  radius={[12, 12, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </AnalyticsCard>

        {/* =====================================================
            SESSION PERFORMANCE
        ===================================================== */}

        <AnalyticsCard
          title="Performance Overview"
          subtitle="Recovery insights"
        >

          <div className="space-y-4 mt-5">

            <InsightCard
              title="Cadence Improving"
              description="Cadence consistency has increased over recent sessions."
              positive
            />

            <InsightCard
              title="Balanced Pressure"
              description="Pressure distribution appears stable during movement."
            />

            <InsightCard
              title="Impact Elevated"
              description="Running sessions show higher impact than walking."
              warning
            />

          </div>

        </AnalyticsCard>

        {/* =====================================================
            SESSION LIST
        ===================================================== */}

        <AnalyticsCard
          title="Recent Sessions"
          subtitle="Latest recovery activity"
        >

          <div className="space-y-3 mt-5">

            {sessions.map((session, index) => (
              <div
                key={session._id}
                className="
                  bg-[#F8FAFC]
                  rounded-2xl
                  p-4
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <div className="text-sm font-semibold text-[#111827]">
                    Session #{index + 1}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {session.latestFrame.activity}
                  </div>

                </div>

                <div className="text-right">

                  <div className="text-sm font-bold text-[#111827]">
                    {session.latestFrame.steps} steps
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    {session.latestFrame.cadence} spm
                  </div>

                </div>

              </div>
            ))}

          </div>

        </AnalyticsCard>

      </div>
    </div>
  );
}

/* =========================================================
   ANALYTICS CARD
========================================================= */

function AnalyticsCard({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="bg-white rounded-[28px] p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <h2 className="text-lg font-bold text-[#111827]">
            {title}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {subtitle}
          </p>
        </div>

        <div className="bg-gray-100 rounded-xl p-2">
          <TrendingUp size={16} className="text-gray-600" />
        </div>

      </div>

      {children}

    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  title,
  value,
  suffix,
  icon,
  subtitle,
}) {
  return (
    <div className="bg-white rounded-[28px] p-5 shadow-sm">

      <div className="flex items-center justify-between mb-5">

        <div className="bg-[#F3F4F6] rounded-2xl p-3 text-gray-700">
          {icon}
        </div>

        <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
          {title}
        </div>

      </div>

      <div className="flex items-end gap-1">

        <div className="text-3xl font-bold text-[#111827] tracking-tight">
          {value}
        </div>

        {suffix && (
          <div className="text-sm text-gray-400 mb-1">
            {suffix}
          </div>
        )}

      </div>

      <div className="text-sm text-gray-500 mt-2">
        {subtitle}
      </div>

    </div>
  );
}

/* =========================================================
   INSIGHT CARD
========================================================= */

function InsightCard({
  title,
  description,
  positive,
  warning,
}) {
  return (
    <div
      className={`
        rounded-2xl
        p-4
        border
        ${
          positive
            ? "bg-green-50 border-green-100"
            : warning
            ? "bg-amber-50 border-amber-100"
            : "bg-[#F8FAFC] border-gray-100"
        }
      `}
    >

      <div className="text-sm font-semibold text-[#111827]">
        {title}
      </div>

      <div className="text-sm text-gray-500 mt-1 leading-relaxed">
        {description}
      </div>

    </div>
  );
}