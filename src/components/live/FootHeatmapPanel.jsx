import React from "react";

const COORDS = {
  T1: [270, 120], T2: [210, 130], T3: [160, 150], T4: [110, 190], T5: [80, 240],
  M1: [250, 300], M2: [200, 310], M3: [160, 320], M4: [120, 340], M5: [80, 380],
  MM: [220, 500], CM: [170, 520], LM: [120, 540],
  MH: [200, 800], CH: [160, 820], LH: [120, 800]
};

function getColor(p = 0) {
  if (p > 750) return "#ef4444";
  if (p > 450) return "#f59e0b";
  if (p > 150) return "#22c55e";
  if (p > 30) return "#3b82f6";
  return "transparent";
}

export function PressureHeatmap({ side, grid }) {
  const filterId = `heatmap-glow-${side}`;

  return (
    <div style={{ textAlign: "center" }}>
      <svg
        viewBox="0 0 390 1024"
        style={{
          width: "190px",
          transform: side === "LEFT" ? "scaleX(-1)" : "scaleX(1)",
        }}
      >
        <defs>
          {/* Gaussian Blur for the heatmap bleed */}
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -5"
            />
          </filter>
        </defs>

        {/* Foot Outline */}
        <path
          d="M 146.84375,0.03125 C 109.95012,0.87132005 77.804347,24.535814 60.40625,56.84375 15.67886,139.90166 5.98577,236.56291 3.375,329.65625 1.34058,402.19801 43.58049,461.62318 75.34375,522.0625 97.68771,564.57872 87.84918,613.0258 67.75,653.5625 30.56443,728.55959 -13.57902,811.11577 3.96875,897.5 c 13.82366,62.11419 48.25267,128.1125 151.875,126.4688 67.74652,0.3437 119.96317,-56.11548 139.3125,-115.8438 27.55115,-85.04608 30.14629,-176.12225 41.78125,-264.5625 8.17855,-62.16708 29.89316,-120.52663 43.78125,-181.21875 25.60704,-111.90496 -3.40287,-229.29332 -59.125,-327 C 286.49061,73.791691 234.62821,8.642448 158.4375,0.5 154.53002,0.08241078 150.66033,-0.0556538 146.84375,0.03125 z"
          fill="#fcfcfc"
          stroke="#e5e7eb"
          strokeWidth="3"
        />

        {/* LAYER 1: The Blurred Heat Effect */}
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

        {/* LAYER 2: The Visible Sensor Points */}
        <g>
          {Object.keys(COORDS).map((id) => (
            <React.Fragment key={`sensor-group-${id}`}>
              {/* Core Dot */}
              <circle
                cx={COORDS[id][0]}
                cy={COORDS[id][1]}
                r={6}
                fill={grid[id] > 30 ? "#fff" : "#ddd"}
                stroke={grid[id] > 30 ? getColor(grid[id]) : "#ccc"}
                strokeWidth={2}
              />
              {/* Optional: Small label for the sensor */}
              <text
                x={COORDS[id][0]}
                y={COORDS[id][1] - 12}
                fontSize="10"
                textAnchor="middle"
                fill="#999"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {grid[id] > 0 ? grid[id] : ''}
              </text>
            </React.Fragment>
          ))}
        </g>
      </svg>
      <h4 style={{ color: "#4b5563" }}>{side}</h4>
    </div>
  );
}