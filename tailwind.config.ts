import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        saffron: "#E97824",
        gold: "#F6B93B",
        maroon: "#681C29",
        river: "#276C80",
        cream: "#FFF5DF",
        night: "#101D38",
      },
      fontFamily: {
        sans: ["var(--font-hindi)", "var(--font-en)", "Mukta", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-hindi)", "serif"],
      },
      boxShadow: {
        warm: "0 10px 40px -12px rgba(104,28,41,0.45)",
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        pulseRing: { "0%": { transform: "scale(.7)", opacity: ".9" }, "100%": { transform: "scale(1.7)", opacity: "0" } },
        scrollDot: { "0%": { transform: "translateY(0)", opacity: "1" }, "100%": { transform: "translateY(14px)", opacity: "0" } },
      },
      animation: {
        floaty: "floaty 4s ease-in-out infinite",
        pulseRing: "pulseRing 1.8s ease-out infinite",
        scrollDot: "scrollDot 1.6s ease-in infinite",
      },
    },
  },
  plugins: [],
};
export default config;
