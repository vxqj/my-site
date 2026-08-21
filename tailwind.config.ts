import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#05060f",
        panel: "#10132b",
        border: "#2a2f5c",
        dim: "#7d84b8",
        cyan: "#4cf3ff",
        magenta: "#ff5fc4",
        amber: "#ffcb47",
        lime: "#8bff6b",
        violet: "#b98bff"
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "sans-serif"],
        body: ["var(--font-grotesk)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(76,243,255,0.15)"
      }
    }
  },
  plugins: []
};

export default config;
