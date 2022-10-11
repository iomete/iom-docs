/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  important: true,
  plugins: [],
  darkMode: ['class', '[data-theme="dark"]'],
  corePlugins: { preflight: false }
}
