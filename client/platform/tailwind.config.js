/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  safelist: [
    "hover:text-cyan-300",
    "hover:text-cyan-400",
    "hover:bg-cyan-500/10",
    "hover:border-cyan-400/20",
    "hover:border-cyan-400/30",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

