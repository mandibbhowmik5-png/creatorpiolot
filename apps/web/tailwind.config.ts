import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07080A",
        foreground: "#F8FAFC",
        card: {
          DEFAULT: "rgba(13, 15, 20, 0.75)",
          hover: "rgba(20, 24, 33, 0.85)",
          border: "rgba(255, 255, 255, 0.08)",
        },
        cyber: {
          cyan: "#22D3EE",
          magenta: "#EC4899",
          violet: "#8B5CF6",
          dark: "#0B0E14",
          border: "rgba(34, 211, 238, 0.2)",
        },
        tension: {
          high: "#EC4899",
          mid: "#F59E0B",
          low: "#22D3EE",
        }
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-glow": "pulseGlow 2.5s infinite ease-in-out",
        "border-spin": "borderSpin 4s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.03)" },
        },
        borderSpin: {
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        }
      },
      boxShadow: {
        "cyan-glow": "0 0 25px -5px rgba(34, 211, 238, 0.25)",
        "magenta-glow": "0 0 25px -5px rgba(236, 72, 153, 0.25)",
        "violet-glow": "0 0 30px -5px rgba(139, 92, 246, 0.25)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      }
    },
  },
  plugins: [],
};

export default config;
