import React, { useState } from "react";

const COORDS = {
  T1: [270, 120], T2: [210, 130], T3: [160, 150], T4: [110, 190], T5: [80, 240],
  M1: [250, 300], M2: [200, 310], M3: [160, 320], M4: [120, 340], M5: [80, 380],
  MM: [220, 500], CM: [170, 520], LM: [120, 540],
  MH: [200, 800], CH: [160, 820], LH: [120, 800],
};

function getColor(p = 0) {
  if (p > 750) return "#EF4444";
  if (p > 450) return "#F59E0B";
  if (p > 150) return "#22C55E";
  if (p > 30) return "#3B82F6";
  return "transparent";
}

export function PressureHeatmap({
  side,
  grid,
  compact = false,
}) {
  const filterId = `heatmap-glow-${side}`;
  // Track which sensor is currently tapped/clicked
  const [activeSensor, setActiveSensor] = useState(null);

  return (
    <div className="flex flex-col items-center relative">
      <svg
        viewBox="0 0 390 1024"
        className={`${compact ? "w-[120px]" : "w-[190px]"}`}
        style={{
          transform: side === "LEFT" ? "scaleX(-1)" : "scaleX(1)",
        }}
      >
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -5"
            />
          </filter>
        </defs>

        {/* FOOT */}
        <path
          d="M 146.84375,0.03125 C 109.95012,0.87132005 77.804347,24.535814 60.40625,56.84375 15.67886,139.90166 5.98577,236.56291 3.375,329.65625 1.34058,402.19801 43.58049,461.62318 75.34375,522.0625 97.68771,564.57872 87.84918,613.0258 67.75,653.5625 30.56443,728.55959 -13.57902,811.11577 3.96875,897.5 c 13.82366,62.11419 48.25267,128.1125 151.875,126.4688 67.74652,0.3437 119.96317,-56.11548 139.3125,-115.8438 27.55115,-85.04608 30.14629,-176.12225 41.78125,-264.5625 8.17855,-62.16708 29.89316,-120.52663 43.78125,-181.21875 25.60704,-111.90496 -3.40287,-229.29332 -59.125,-327 C 286.49061,73.791691 234.62821,8.642448 158.4375,0.5 154.53002,0.08241078 150.66033,-0.0556538 146.84375,0.03125 z"
          fill="#FCFCFC"
          stroke="#E5E7EB"
          strokeWidth="3"
        />

        {/* GLOW */}
        <g filter={`url(#${filterId})`}>
          {Object.keys(COORDS).map((id) => (
            grid[id] > 0 && (
              <circle
                key={`glow-${id}`}
                cx={COORDS[id][0]}
                cy={COORDS[id][1]}
                r={45}
                fill={getColor(grid[id])}
                fillOpacity={0.6}
              />
            )
          ))}
        </g>

        {/* SENSOR POINTS & TOOLTIPS */}
        <g>
          {Object.keys(COORDS).map((id) => {
            const cx = COORDS[id][0];
            const cy = COORDS[id][1];
            const value = grid[id] || 0;
            const isActive = activeSensor === id;

            return (
              <React.Fragment key={id}>
                {/* Visual Sensor Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill={value > 30 ? "#fff" : "#ddd"}
                  stroke={value > 30 ? getColor(value) : "#ccc"}
                  strokeWidth={2}
                  className="transition-colors duration-200 pointer-events-none"
                />

                {/* Mobile Tap Target (Invisible, larger radius for easier tapping) */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={32}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => setActiveSensor(isActive ? null : id)}
                />

                {/* Data Tooltip */}
                {isActive && (
                  <g>
                    {/* Dark Background Pill - Taller to fit name */}
                    <rect
                      x={cx - 50}
                      y={cy - 80}
                      width={100}
                      height={60}
                      rx={10}
                      fill="#111827"
                      className="pointer-events-none shadow-xl"
                    />
                    
                    {/* Text Group - Handles the un-flipping for the left foot */}
                    <g
                      style={{
                        transform: side === "LEFT" ? "scaleX(-1)" : "none",
                        transformOrigin: `${cx}px ${cy - 50}px`
                      }}
                    >
                      {/* FSR Value */}
                      <text
                        x={cx}
                        y={cy - 46}
                        fill="#FFFFFF"
                        fontSize="24"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none font-sans"
                      >
                        {Math.round(value)}
                      </text>
                      
                      {/* Sensor Point Name */}
                      <text
                        x={cx}
                        y={cy - 28}
                        fill="#9CA3AF"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none font-sans tracking-widest"
                      >
                        {id}
                      </text>
                    </g>
                  </g>
                )}
              </React.Fragment>
            );
          })}
        </g>
      </svg>

      <div className="mt-2 text-sm font-semibold text-gray-600">
        {side}
      </div>
    </div>
  );
}