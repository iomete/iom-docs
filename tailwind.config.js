/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        '7.5xl': '5rem',
        '19': '1.1875rem',
      },
      maxWidth: {
        '700': '43.75rem',
      },
      colors: {
        'primary-light': '#0070f3',
        'primary-dark': '#006ce8',
      }
    },
  },
  important: true,
  plugins: [],
  darkMode: ['class', '[data-theme="dark"]'],
  corePlugins: { preflight: false }
}
