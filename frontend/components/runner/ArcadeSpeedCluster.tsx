"use client";

const SPEEDO_MAX_KMH = 240;

export function ArcadeSpeedCluster({
  speedKmh,
  gear,
  isBoosting = false,
}: {
  speedKmh: number;
  gear: number;
  isBoosting?: boolean;
}) {
  const percentage = speedKmh / SPEEDO_MAX_KMH;
  const circumference = 2 * Math.PI * 40;
  const strokeDash = percentage * circumference * 0.75; // 270 degree arc

  const arcColor = isBoosting ? "#ff2244" : percentage > 0.8 ? "#ffaa00" : "#00E5CC";

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        width: "110px",
        height: "110px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="110" height="110" viewBox="0 0 110 110">
        {/* Background arc */}
        <circle
          cx="55"
          cy="55"
          r="40"
          fill="rgba(5,0,20,0.85)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        {/* Track arc */}
        <circle
          cx="55"
          cy="55"
          r="40"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="6"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeDashoffset={circumference * 0.125}
          strokeLinecap="round"
          transform="rotate(135 55 55)"
        />
        {/* Speed arc — teal normally, amber at 80%+, red when boosting */}
        <circle
          cx="55"
          cy="55"
          r="40"
          fill="none"
          stroke={arcColor}
          strokeWidth="6"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeDashoffset={circumference * 0.125}
          strokeLinecap="round"
          transform="rotate(135 55 55)"
          style={{ transition: "stroke-dasharray 0.1s, stroke 0.3s" }}
        />
        {/* Speed number */}
        <text
          x="55"
          y="52"
          textAnchor="middle"
          fill={isBoosting ? "#ff2244" : "#ffffff"}
          fontSize="18"
          fontFamily="Bebas Neue, monospace"
          fontWeight="bold"
        >
          {Math.round(speedKmh)}
        </text>
        {/* KM/H label */}
        <text
          x="55"
          y="64"
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="8"
          fontFamily="monospace"
          letterSpacing="1"
        >
          KM/H
        </text>
        {/* GHOST label when boosting */}
        {isBoosting && (
          <text
            x="55"
            y="76"
            textAnchor="middle"
            fill="#ff2244"
            fontSize="7"
            fontFamily="Bebas Neue"
            letterSpacing="2"
          >
            GHOST
          </text>
        )}
      </svg>
      {/* Gear indicator below */}
      <div
        style={{
          position: "absolute",
          bottom: "6px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "3px",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "8px",
            letterSpacing: "1px",
            fontFamily: "monospace",
          }}
        >
          GEAR
        </span>
        <span
          style={{
            color: isBoosting ? "#ff2244" : "#00E5CC",
            fontSize: "12px",
            fontFamily: "Bebas Neue",
            transition: "color 0.3s",
          }}
        >
          {gear}
        </span>
      </div>
    </div>
  );
}
