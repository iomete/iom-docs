// Ensures `window.gtag` is always callable.
//
// GA4 is fired through the GTM container (see docusaurus.config.js), which
// defines the real `window.gtag` at runtime. Until that loads — or if a
// privacy/ad blocker strips it — any stray `window.gtag()` call would throw
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
