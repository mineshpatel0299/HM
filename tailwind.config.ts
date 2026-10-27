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
        ink: "#302831",
        "ink-muted": "#79717A",
        paper: "#F8F6F3",
        paper2: "#F0ECE8",
        ember: "#A54F68",
        emberDark: "#71364D",
        amber: "#B17C3E",
        lilac: "#8B7BA3",
        sage: "#648878",
        line: "rgba(65, 43, 51, 0.09)",
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
