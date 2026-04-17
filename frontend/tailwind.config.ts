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
      colors: {
        void: "#020408",
        abyss: "#050a12",
        ink: "#0a1220",
      },
      boxShadow: {
        "neon-cyan": "0 0 24px rgba(34, 211, 238, 0.32), 0 0 56px rgba(34, 211, 238, 0.1)",
        "neon-fuchsia": "0 0 28px rgba(232, 121, 249, 0.35), 0 0 64px rgba(232, 121, 249, 0.12)",
        "panel-inset": "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.45)",
        lift: "0 24px 80px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "grid-neon":
          "linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px)",
        "shine-sweep": "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
