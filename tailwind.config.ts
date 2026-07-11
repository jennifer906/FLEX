import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6262EE",
        "primary-light": "#EFEFFD",
        "primary-dark": "#4A4AB8",
        surface: "#F2F2F7",
        border: "#E5E5EA",
        "text-primary": "#1C1C1E",
        "text-secondary": "#3C3C43",
        "text-caption": "#8E8E93",
        confirmed: "#34C759",
        holding: "#FF9500",
        undispatched: "#FF3B30",
        additional: "#007AFF",
        "confirmed-bg": "#E8F9ED",
        "holding-bg": "#FFF4E5",
        "undispatched-bg": "#FFF0EE",
        "additional-bg": "#EBF4FF",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
