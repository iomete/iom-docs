module.exports = {
  // content: ["./src/**/*.{js,jsx,ts,tsx}"],
  // content: ["./src/pages/ai/**/*.{js,jsx,ts,tsx}"],

  content: {
    relative: true,
    files: ["./src/pages/glossary/**/*.{ts,tsx,js,jsx}"],
    // "./src/theme/BlogListPage/*.{ts,js,tsx}", "./src/**/*.{js,jsx,ts,tsx}"
  },
  corePlugins: {
    preflight: false,
  },
};
