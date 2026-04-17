import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "DashRunner — neon endless runner for MiniPay";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(125deg, #010F10 0%, #0d2830 40%, #1f0a28 100%)",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 86,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#f472b6",
          }}
        >
          DashRunner
        </div>
        <div style={{ marginTop: 28, fontSize: 36, color: "rgba(207, 250, 254, 0.9)", maxWidth: 900 }}>
          Neon endless runner on Celo — built for MiniPay
        </div>
      </div>
    ),
    { ...size }
  );
}
