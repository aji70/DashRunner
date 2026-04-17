import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "ui-sans-serif", "system-ui", "sans-serif"],
        rajdhani: ["var(--font-rajdhani)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-rajdhani)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neon-cyan": "0 0 20px rgba(34, 211, 238, 0.35), 0 0 40px rgba(34, 211, 238, 0.12)",
        "neon-fuchsia": "0 0 24px rgba(232, 121, 249, 0.35), 0 0 48px rgba(232, 121, 249, 0.1)",
        "panel-inset": "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.45)",
      },
      backgroundImage: {
        "grid-neon":
          "linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
