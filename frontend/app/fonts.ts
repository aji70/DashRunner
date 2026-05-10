import { Orbitron, Rajdhani, Bebas_Neue } from "next/font/google";

export const fontOrbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const fontRajdhani = Rajdhani({
  subsets: ["latin"],
  variable: "--font-rajdhani",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const fontBebas = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-turbo-heading",
  display: "swap",
  weight: "400",
});
