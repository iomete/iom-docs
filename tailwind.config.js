module.exports = {
  // content: ["./src/**/*.{js,jsx,ts,tsx}"],
  // content: ["./src/pages/ai/**/*.{js,jsx,ts,tsx}"],

  content: {
    relative: true,
    files: ["./src/pages/ai/**/*.{ts,tsx}"],
  },
  corePlugins: {
    preflight: false,
  },
};
