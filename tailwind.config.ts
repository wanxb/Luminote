import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        paper: "#f7f3ea",
        sand: "#dfd2bd",
        ember: "#8f5838",
        mist: "#ece7df"
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
        body: ["ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 50px rgba(0, 0, 0, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
