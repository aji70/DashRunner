import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1024,
  height: 1024,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #12100e 0%, #2a1410 45%, #1a0806 100%)",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 220,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#fb923c",
            }}
          >
            DR
          </div>
          <div style={{ fontSize: 42, color: "rgba(255, 230, 200, 0.9)", fontWeight: 600 }}>DashRunner</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
