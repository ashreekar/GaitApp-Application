import React from "react";

// Standardizing sensor zones based on anatomy
const ZONES = {
  FOREFOOT: ["T1", "T2", "T3", "T4", "T5", "M1", "M2", "M3", "M4", "M5"],
  MIDFOOT: ["MM", "CM", "LM"],
  REARFOOT: ["MH", "CH", "LH"],
};

// Helper to determine zone colors similar to the reference image
function getZoneColor(pct, side) {
  if (pct === 0) return "#F8FAFC"; // Empty state
  
  if (side === "LEFT") {
    // Pink/Magenta scale for left foot
    if (pct >= 50) return "#8B1E4D"; 
    if (pct >= 15) return "#B9618B";
    return "#E8BCCD"; 
  } else {
    // Blue scale for right foot
    if (pct >= 50) return "#1C3A7A"; 
    if (pct >= 15) return "#6586C4"; 
    return "#C8DAF3"; 
  }
}

export function ZoneHeatmap({
  side = "LEFT",
  grid = {},
  compact = false,
}) {
  const clipId = `foot-clip-zone-${side}`;

  // 1. Calculate Zone Sums
  const totalPressure = Object.values(grid).reduce((sum, val) => sum + val, 0);

  const getZonePercentage = (sensorKeys) => {
    if (totalPressure === 0) return 0;
    const zoneSum = sensorKeys.reduce((sum, key) => sum + (grid[key] || 0), 0);
    return Math.round((zoneSum / totalPressure) * 100);
  };

  const forefootPct = getZonePercentage(ZONES.FOREFOOT);
  const midfootPct = getZonePercentage(ZONES.MIDFOOT);
  const rearfootPct = getZonePercentage(ZONES.REARFOOT);

  // Layout parameters for text and lines
  const isLeft = side === "LEFT";
  const footTransform = isLeft 
    ? "translate(380, 0) scale(-1, 1)" // Flips the foot path for the left side
    : "translate(220, 0)";             // Keeps it normal for the right side

  const textX = isLeft ? 100 : 500;
  const lineEndX = isLeft ? 120 : 480;
  const lineStartX = isLeft ? 240 : 360;
  const textAnchor = isLeft ? "end" : "start";

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 600 1024"
        className={`${compact ? "w-[240px]" : "w-[360px]"} font-sans`}
      >
        <defs>
          <clipPath id={clipId}>
            <path d="M 146.84375,0.03125 C 109.95012,0.87132005 77.804347,24.535814 60.40625,56.84375 15.67886,139.90166 5.98577,236.56291 3.375,329.65625 1.34058,402.19801 43.58049,461.62318 75.34375,522.0625 97.68771,564.57872 87.84918,613.0258 67.75,653.5625 30.56443,728.55959 -13.57902,811.11577 3.96875,897.5 c 13.82366,62.11419 48.25267,128.1125 151.875,126.4688 67.74652,0.3437 119.96317,-56.11548 139.3125,-115.8438 27.55115,-85.04608 30.14629,-176.12225 41.78125,-264.5625 8.17855,-62.16708 29.89316,-120.52663 43.78125,-181.21875 25.60704,-111.90496 -3.40287,-229.29332 -59.125,-327 C 286.49061,73.791691 234.62821,8.642448 158.4375,0.5 154.53002,0.08241078 150.66033,-0.0556538 146.84375,0.03125 z" />
          </clipPath>
        </defs>

        {/* FOOT & COLOR BLOCKS */}
        <g transform={footTransform}>
          {/* Base Foot Outline */}
          <path
            d="M 146.84375,0.03125 C 109.95012,0.87132005 77.804347,24.535814 60.40625,56.84375 15.67886,139.90166 5.98577,236.56291 3.375,329.65625 1.34058,402.19801 43.58049,461.62318 75.34375,522.0625 97.68771,564.57872 87.84918,613.0258 67.75,653.5625 30.56443,728.55959 -13.57902,811.11577 3.96875,897.5 c 13.82366,62.11419 48.25267,128.1125 151.875,126.4688 67.74652,0.3437 119.96317,-56.11548 139.3125,-115.8438 27.55115,-85.04608 30.14629,-176.12225 41.78125,-264.5625 8.17855,-62.16708 29.89316,-120.52663 43.78125,-181.21875 25.60704,-111.90496 -3.40287,-229.29332 -59.125,-327 C 286.49061,73.791691 234.62821,8.642448 158.4375,0.5 154.53002,0.08241078 150.66033,-0.0556538 146.84375,0.03125 z"
            fill="#FFFFFF"
            stroke="#E5E7EB"
            strokeWidth="4"
          />

          {/* Color Fill Zones Clipped to Foot Shape */}
          <g clipPath={`url(#${clipId})`}>
            <rect x="0" y="0" width="400" height="420" fill={getZoneColor(forefootPct, side)} />
            <rect x="0" y="420" width="400" height="230" fill={getZoneColor(midfootPct, side)} />
            <rect x="0" y="650" width="400" height="374" fill={getZoneColor(rearfootPct, side)} />
          </g>

          {/* Inner Zone Dots */}
          {[270, 530, 800].map((cy, i) => (
            <g key={i}>
              <circle cx="140" cy={cy} r="18" fill="#111827" />
              <circle cx="140" cy={cy} r="6" fill="#FFFFFF" />
            </g>
          ))}
        </g>

        {/* CONNECTING LINES & TEXT (Rendered outside transformation to prevent text mirroring) */}
        <g stroke="#D1D5DB" strokeWidth="2" strokeDasharray="4 4">
          <line x1={lineStartX} y1="270" x2={lineEndX} y2="270" />
          <line x1={lineStartX} y1="530" x2={lineEndX} y2="530" />
          <line x1={lineStartX} y1="800" x2={lineEndX} y2="800" />
        </g>

        <g fill="#111827" textAnchor={textAnchor}>
          {/* Forefoot Label */}
          <text x={textX} y="265" fontSize="48" fontWeight="bold">{forefootPct}%</text>
          <text x={textX} y="295" fontSize="24" fill="#6B7280">Forefoot</text>

          {/* Midfoot Label */}
          <text x={textX} y="525" fontSize="48" fontWeight="bold">{midfootPct}%</text>
          <text x={textX} y="555" fontSize="24" fill="#6B7280">Midfoot</text>

          {/* Rearfoot Label */}
          <text x={textX} y="795" fontSize="48" fontWeight="bold">{rearfootPct}%</text>
          <text x={textX} y="825" fontSize="24" fill="#6B7280">Rearfoot</text>
        </g>
      </svg>

      <div className="mt-4 text-lg font-semibold text-gray-400 tracking-widest">
        {isLeft ? "L" : "R"}
      </div>
    </div>
  );
}