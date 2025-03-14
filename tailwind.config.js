import { heroui } from "@heroui/theme"

/** @type {import('tailwindcss').Config} */

export default {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './misc/*.{js,ts,jsx,tsx,md}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  plugins: [heroui()],
}