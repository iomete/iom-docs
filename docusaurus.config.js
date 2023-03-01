// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "IOMETE docs",
  tagline: "First cloud-prem lakehouse",
  url: "https://iomete.com",
  baseUrl: "/docs/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.png",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: 'facebook', // Usually your GitHub org/user name.
  // projectName: 'docusaurus', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  // i18n: {
  //   defaultLocale: 'en',
  //   locales: ['en'],
  // },

  scripts: ["/docs/js/heap.js"],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').  Options} */
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          breadcrumbs: false,
          // autoCollapseCategories: false,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.scss"),
        },
        gtag: {
          trackingID: "G-YMX75JE2MY",
          anonymizeIP: false,
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          ignorePatterns: ["/docs/tags/**"],
          filename: "sitemap.xml",
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    {
      metadata: [
        // { name: 'keywords', content: 'iomete, datalake, lakehouse, warehouse, docs, documentation, sql editor, big data' },
        { name: "og:image", content: "https://iomete.com/docs/img/meta/open-graph.png" },
        { name: "twitter:image", content: "https://iomete.com/docs/img/meta/open-graph.png" },
        {
          name: "og:type",
          content: "website",
        },
        {
          name: "og:site_name",
          content: "iomete Docs",
        },
      ],
      // docs: {
      //   sidebar: {
      //     hideable: true,
      //     autoCollapseCategories: true
      //   }
      // },
      navbar: {
        // title: 'My Site',
        hideOnScroll: false,
        logo: {
          alt: "iomete logo",
          src: `/img/logo-black.svg`,
          srcDark: `/img/logo-white.svg`,
          href: "https://iomete.com",
          target: "_self",
          height: 42,
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Docs",
          },
          {
            type: "doc",
            docId: "guides",
            label: "Guides",
            position: "left",
          },
          { to: "https://iomete.com/blog", label: "Blog", position: "left", target: "_self" },
          {
            href: "https://api.iomete.com",
            label: "API",
            position: "right",
          },
          {
            href: "https://github.com/iomete",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: "A90PMTH5W5",
        apiKey: "3c9132c4cdf813a81e47299fde60c651",
        indexName: "iomete",
        contextualSearch: false,
      },
      colorMode: {
        defaultMode: "light",
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
    },
  plugins: ["docusaurus-plugin-sass"],
};

module.exports = config;
