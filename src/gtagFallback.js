// Ensures `window.gtag` is always callable.
//
// The @docusaurus/plugin-google-gtag route-change handler calls `window.gtag()`
// on every navigation. If a privacy/ad blocker strips the plugin's inline init
// script, `window.gtag` is undefined and each page switch throws
// "window.gtag is not a function". Defining a no-op fallback here (this module
// runs during app bootstrap, before any route update) prevents the error while
// leaving the real gtag untouched when it does load.
if (typeof window !== "undefined") {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
}
