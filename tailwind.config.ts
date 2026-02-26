import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0B",
        paper: "#FAFAFA",
        fog: "rgba(11,11,11,0.55)",
        hair: "rgba(11,11,11,0.12)",
        hairDark: "rgba(250,250,250,0.14)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        museum: "0 12px 40px rgba(11,11,11,0.08)",
        "museum-lg": "0 24px 60px rgba(11,11,11,0.12)",
      },
      letterSpacing: {
        plaque: "0.02em",
      },
      animation: {
        "calibrate": "calibrate 0.6s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        calibrate: {
          "0%": { transform: "scaleX(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "scaleX(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
