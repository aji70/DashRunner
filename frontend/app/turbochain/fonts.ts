import { Bebas_Neue, DM_Sans, JetBrains_Mono } from "next/font/google";

/** Display / hero headings for TurboChain screens */
export const turboFontHeading = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-turbo-heading",
  weight: "400",
  display: "swap",
});

/** Body copy — DM Sans */
export const turboFontBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-turbo-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** All numeric HUD and stats use JetBrains Mono */
export const turboFontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-turbo-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
