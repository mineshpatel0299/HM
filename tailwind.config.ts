import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1E152A",
        "ink-muted": "#5C4F70",
        paper: "#FAF5F0",
        paper2: "#F3ECE3",
        ember: "#E05A77",
        emberDark: "#9B304A",
        amber: "#F59E0B",
        lilac: "#9D84B7",
        sage: "#5A8264",
        line: "rgba(30, 21, 42, 0.08)",
        "line-dark": "rgba(255, 255, 255, 0.12)",
        "rose-glow": "#FFB8C6",
        "gold-glow": "#FDE68A",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-work-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 15, 45, 0.06)",
        "glass-hover": "0 14px 40px 0 rgba(224, 90, 119, 0.15)",
        glow: "0 0 25px rgba(224, 90, 119, 0.35)",
        "glow-amber": "0 0 25px rgba(245, 158, 11, 0.35)",
        floating: "0 20px 40px -15px rgba(30, 21, 42, 0.12)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        heartbeat: "heartbeat 1.5s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
