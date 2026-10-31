import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0d14",
        surface: {
          deep: "#07080d",
          page: "#0b0d14",
          card: "#11141c",
          raised: "#1a1e28",
        },
        ink: {
          hairline: "rgba(238, 240, 245, 0.08)",
          primary: "#eef0f5",
          secondary: "#a3a9b8",
          muted: "#7a8296",
        },
        semantic: {
          crimson: "#e5484d",
          pine: "#4cc38a",
          amber: "#d97706",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
