import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { brand: "#245A81", deep: "#173B57", canvas: "#F8FAFC" }, boxShadow: { soft: "0 12px 38px rgba(23,59,87,.055)" } } },
  plugins: [],
};
export default config;
