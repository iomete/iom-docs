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
      },
      // screens: {
      //   'sm-only': {'min': '640px', 'max': '767px'},
      //   // => @media (min-width: 640px and max-width: 767px) { ... }
  
      //   'md-only': {'min': '768px', 'max': '1023px'},
      //   // => @media (min-width: 768px and max-width: 1023px) { ... }
  
      //   'lg-only': {'min': '1024px', 'max': '1279px'},
      //   // => @media (min-width: 1024px and max-width: 1279px) { ... }
  
      //   'xl-only': {'min': '1280px', 'max': '1535px'},
      //   // => @media (min-width: 1280px and max-width: 1535px) { ... }
  
      //   '2xl-only': {'min': '1536px'},
      //   // => @media (min-width: 1536px) { ... }
      // }
    },
  },
  important: true,
  plugins: [],
  darkMode: ['class', '[data-theme="dark"]'],
  corePlugins: { preflight: false }
}
