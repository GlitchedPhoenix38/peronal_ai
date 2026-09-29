import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f7f4",
          100: "#e9e7df",
          200: "#cecbc0",
          500: "#6d6a60",
          700: "#37352f",
          900: "#171715"
        },
        paper: "#fbfaf6",
        line: "#e6e1d6",
        accent: "#1f6feb"
      },
      boxShadow: {
        soft: "0 18px 48px rgba(23, 23, 21, 0.08)",
        lift: "0 10px 24px rgba(23, 23, 21, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
