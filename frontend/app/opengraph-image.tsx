import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "DashRunner — arcade street racing for MiniPay";

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
          background: "linear-gradient(125deg, #12100e 0%, #2a1810 40%, #240808 100%)",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 86,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#FB923C",
          }}
        >
          DashRunner
        </div>
        <div style={{ marginTop: 28, fontSize: 36, color: "rgba(255, 237, 213, 0.92)", maxWidth: 900 }}>
          Arcade street racing on Celo — built for MiniPay
        </div>
      </div>
    ),
    { ...size }
  );
}
