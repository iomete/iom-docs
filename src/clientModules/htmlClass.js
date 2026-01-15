import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import siteConfig from "@generated/docusaurus.config";

export default (function () {
  if (!ExecutionEnvironment.canUseDOM) return;

  const htmlClassName = siteConfig.customFields?.htmlClassName;
  if (!htmlClassName) return;

  const html = document.documentElement;

  const ensure = () => {
    if (!html.classList.contains(htmlClassName)) {
      html.classList.add(htmlClassName);
    }
  };

  ensure();

  // Keep it if something overwrites html.className later
  const obs = new MutationObserver(ensure);
  obs.observe(html, { attributes: true, attributeFilter: ["class"] });
})();
