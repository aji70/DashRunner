import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import FarcasterReady from "@/components/FarcasterReady";
import { Providers } from "./providers";
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
      default: "DashRunner — arcade street racing",
      template: "%s | DashRunner",
    },
    description: "Arcade street racing on Celo for MiniPay: laps, shop, rewards, and on-chain score sync.",
    other: {
      "talentapp:project_verification":
        "c4e5c61e56fe1ac0b13b4ed9848e47dec37e284d43599876bc8f0785ec581a6e05e13d54f6a8bbf0fbe7f85aa092bee63a04d3f2b6cacddef74063f4dee9ff26",
      "fc:frame": JSON.stringify({
        version: minikitConfig.miniapp.version,
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        images: {
          url: minikitConfig.miniapp.heroImageUrl,
          alt: "DashRunner — MiniPay racing on Celo",
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
      <body className="min-h-dvh bg-void font-sans antialiased text-[var(--text-primary)]">
        <Providers>
          <FarcasterReady />
          {children}
        </Providers>
      </body>
    </html>
  );
}
