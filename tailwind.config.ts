import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#0A0A0F",
        ron: "#185FA5",
        mes: "#1D9E75",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        outfit: ["var(--font-outfit)", "sans-serif"],
        space: ["var(--font-space-grotesk)", "sans-serif"],
      },
      boxShadow: {
        glowBlue: "0 0 40px rgba(24, 95, 165, 0.38)",
        glowGreen: "0 0 40px rgba(29, 158, 117, 0.34)",
      },
    },
  },
  plugins: [],
};

export default config;
