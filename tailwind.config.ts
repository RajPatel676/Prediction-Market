import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-1rem)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        slideDown: "slideDown 0.5s ease-out forwards",
      },
      spacing: {
        customNav: "7.25rem",
      },
      colors: {
        "body-grey": "#171717",
        "body-light-grey": "#454545",
        "nice-blue": "#61a8ff",
        "ivory-light": "#faf9f5",
        "dark-blue": "#030677",
      },
      fontFamily: {
        body: ["var(--font-roboto-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
