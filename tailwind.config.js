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
    extend: {
      boxShadow: {
        iom: "0px 5px 10px 0px #0000000A",
        "iom-dark": "0px 3px 5px 0px #363636",
      },
    },
  },
  plugins: [],
};
