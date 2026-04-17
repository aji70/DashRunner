import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "DashRunner — neon endless runner",
  description: "Swipe runner with city routes, shop, daily rewards, and on-chain score sync.",
};

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
    <html lang="en">
      <head>
        <script src="/disable-extensions.js" />
      </head>
      <body className="bg-[#010F10]">{children}</body>
    </html>
  );
}
