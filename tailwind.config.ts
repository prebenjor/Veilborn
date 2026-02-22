import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: "#04060f",
        veil: "#9db8c8",
        ember: "#d48455",
        omen: "#8ebf90"
      },
      boxShadow: {
        veil: "0 0 30px rgba(157, 184, 200, 0.24)"
      }
    }
  },
  plugins: []
} satisfies Config;

