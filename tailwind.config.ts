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
        ink: "#241934",
        paper: "#FBF3E7",
        paper2: "#F5ECDD",
        ember: "#C4667B",
        emberDark: "#A94F63",
        amber: "#E8A45C",
        lilac: "#B9A8D6",
        sage: "#7C9473",
        line: "rgba(36,25,52,0.14)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-work-sans)", "ui-sans-serif", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
