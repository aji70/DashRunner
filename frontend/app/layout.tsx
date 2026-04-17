import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import FarcasterReady from "@/components/FarcasterReady";
import { minikitConfig } from "../minikit.config";
import { fontOrbitron, fontRajdhani } from "./fonts";

function resolveMetadataBase(): URL {
  const raw = (process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  const candidate =
    raw ||
    (vercel ? `https://${vercel.replace(/^https?:\/\//, "")}` : "") ||
    "http://localhost:3000";
  try {
    if (/^https?:\/\//i.test(candidate)) {
      return new URL(candidate);
    }
    return new URL(`https://${candidate}`);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: resolveMetadataBase(),
    title: {
      default: "DashRunner — neon endless runner",
      template: "%s | DashRunner",
    },
    description: "Swipe runner on Celo for MiniPay: city routes, shop, daily rewards, and on-chain score sync.",
    other: {
      "fc:frame": JSON.stringify({
        version: minikitConfig.miniapp.version,
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        images: {
          url: minikitConfig.miniapp.heroImageUrl,
          alt: "DashRunner — MiniPay runner on Celo",
        },
        button: {
          title: `Play ${minikitConfig.miniapp.name}`,
          action: {
            name: `Launch ${minikitConfig.miniapp.name}`,
            type: "launch_frame",
          },
        },
      }),
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontOrbitron.variable} ${fontRajdhani.variable}`}>
      <head>
        <script src="/disable-extensions.js" />
      </head>
      <body className="min-h-dvh bg-[#010F10] font-sans antialiased text-cyan-50">
        <FarcasterReady />
        {children}
      </body>
    </html>
  );
}
