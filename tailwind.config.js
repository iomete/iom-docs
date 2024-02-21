module.exports = {
  corePlugins: {
    preflight: false,
    container: false,
  },
  content: ["./src/pages/_hero_new/**"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
    },
    extend: {},
  },
  plugins: [],
};
