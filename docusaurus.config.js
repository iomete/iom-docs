// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

const glossaryPlugin = [
  "@docusaurus/plugin-content-blog",
  {
    /**
     * Required for any multi-instance plugin
     */
    id: "glossary",
    blogSidebarCount: 0,
    /**
     * URL route for the blog section of your site.
     * *DO NOT* include a trailing slash.
     */
    routeBasePath: "glossary",
    /**
     * Path to data on filesystem relative to site dir.
     */
    path: "./glossary",
    blogListComponent: "/src/theme/GlossaryListPage/index.js",

    postsPerPage: "ALL",
    showReadingTime: false,

    onUntruncatedBlogPosts: "ignore",
  },
];

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "IOMETE",
  tagline: "First cloud-prem lakehouse",
  favicon: "favicon.png",

  // Set the production url of your site here
  url: "https://iomete.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/resources/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: 'facebook', // Usually your GitHub org/user name.
  // projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  // i18n: {
  //   defaultLocale: 'en',
  //   locales: ['en'],
  // },

  themes: ["docusaurus-theme-github-codeblock", "@docusaurus/theme-mermaid"],

  markdown: {
    mermaid: true,
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.js",
          breadcrumbs: false,

          editUrl: ({ docPath }) => {
            let match;
            if ((match = docPath.match(/(.*)\.mdx/)) != null) {
              return `https://github.com/iomete/iom-docs/edit/main/docs/${match[1]}.mdx`;
            }

            if ((match = docPath.match(/(.*)\.md/)) != null) {
              return `https://github.com/iomete/iom-docs/edit/main/docs/${match[1]}.md`;
            }

            return "https://github.com/iomete/iom-docs";
          },
        },
        blog: {
          blogSidebarCount: 0,
          postsPerPage: "ALL",
          showReadingTime: true,
          // blogListComponent: "/blog/index.js",
          blogTagsPostsComponent: "/src/theme/BlogListPage/index.js",
          blogTitle: "IOMETE Blog",
          blogDescription:
            "Modern lakehouse platform. Save 5x over expensive alternatives | Built on Apache Iceberg and Apache Spark | Cloud, on premise and hybrid solutions.",
          onUntruncatedBlogPosts: "ignore",
        },

        theme: {
          customCss: [
            "./src/css/custom.scss",
            require.resolve(
              "./node_modules/@ionic-internal/ionic-ds/dist/tokens/tokens.css"
            ),
          ],
        },
        googleTagManager: {
          containerId: "GTM-W4ZH33W",
        },
        gtag: {
          trackingID: "G-YMX75JE2MY",
          anonymizeIP: false,
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          ignorePatterns: [
            "/docs/tags/**",
            "/blog/tags/**",
            "/glossary/tags/**",
            "/resources/docs/tags/**",
            "/resources/blog/tags/**",
            "/resources/glossary/tags/**",
            "/docs/data-policy/**",
            "/docs/user-guide/access-policy-management",
            "/docs/user-guide/serverless-spark-applications",
          ],
          filename: "sitemap.xml",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        { property: "og:image", content: "/resources/IOMETE-og-docs.png" },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "IOMETE Documentation" },
        { name: "twitter:title", content: "IOMETE Documentation" },
        { name: "twitter:site", content: "IOMETE Documentation" },
        { name: "twitter:image", content: "/resources/IOMETE-og-docs.png" },
      ],
      mermaid: {
        theme: {
          light: "neutral",
        },
      },
      codeblock: {
        showGithubLink: true,
        githubLinkLabel: "View on GitHub",
        showRunmeLink: false,
        runmeLinkLabel: "Checkout via Runme",
      },
      navbar: {
        // title: 'My Site',
        logo: {
          alt: "IOMETE",
          src: `/logo-black.svg`,
          srcDark: `/logo-white.svg`,
          href: "https://iomete.com",
          target: "_self",
          // height: 24,
          width: 128,
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "getting_started",
            position: "left",
            label: "Getting Started",
          },
          {
            type: "docSidebar",
            sidebarId: "guides",
            position: "left",
            label: "Guides",
          },
          {
            type: "docSidebar",
            sidebarId: "reference",
            position: "left",
            label: "Reference",
          },
          {
            type: "docSidebar",
            sidebarId: "integrations",
            position: "left",
            label: "Integrations",
          },
          {
            type: "docSidebar",
            sidebarId: "tutorials",
            position: "left",
            label: "Tutorials",
          },
          { to: "/blog", label: "Blog", position: "left" },
          {
            type: "search",
            position: "right",
            className: "navbar-search",
          },

          {
            href: "https://github.com/orgs/iomete/projects/7",
            position: "right",
            className: "link-icon github-link",
            "aria-label": "GitHub repository",
          },
        ],
      },
      algolia: {
        appId: "A90PMTH5W5",
        apiKey: "3c9132c4cdf813a81e47299fde60c651",
        indexName: "iomete",
        contextualSearch: false,
        searchPagePath: false,
      },
      colorMode: {
        respectPrefersColorScheme: true,
      },

      prism: {
        theme: prismThemes.dracula,
        // darkTheme: prismThemes.dracula,
        additionalLanguages: ["bash"],
      },

      zoom: {
        // CSS selector to apply the plugin to, defaults to '.markdown img'
        selector: ".markdown img",
        // Optional medium-zoom options
        // see: https://www.npmjs.com/package/medium-zoom#options
        config: {
          margin: 32,
          background: "rgba(0,0,0,0.6)",
          scrollOffset: 100,
        },
      },
    }),
  headTags: [
    // Inter Variable
    {
      tagName: "link",
      attributes: {
        rel: "preload",
        href: "https://cdn.prod.website-files.com/6799ec9d00832d1abf08b380/679a3594aabfa49cafb5d07e_InterVariable.ttf",
        as: "font",
        type: "font/ttf",
        crossorigin: "anonymous",
      },
    },
    // Archivo Variable
    {
      tagName: "link",
      attributes: {
        rel: "preload",
        href: "https://cdn.prod.website-files.com/6799ec9d00832d1abf08b380/679a361dee69de6073e991b4_Archivo-VariableFont_wdth,wght.ttf",
        as: "font",
        type: "font/ttf",
        crossorigin: "anonymous",
      },
    },
    // DM Mono Medium
    {
      tagName: "link",
      attributes: {
        rel: "preload",
        href: "https://cdn.prod.website-files.com/6799ec9d00832d1abf08b380/679a3657294bb48e01b67f05_DMMono-Medium.ttf",
        as: "font",
        type: "font/ttf",
        crossorigin: "anonymous",
      },
    },
    // DM Mono Regular
    {
      tagName: "link",
      attributes: {
        rel: "preload",
        href: "https://cdn.prod.website-files.com/6799ec9d00832d1abf08b380/679a3650d012930b8d8bd5b0_DMMono-Regular.ttf",
        as: "font",
        type: "font/ttf",
        crossorigin: "anonymous",
      },
    },
  ],
  plugins: [
    "docusaurus-plugin-sass",
    "docusaurus-plugin-image-zoom",

    //tailwind
    async function myPlugin(context, options) {
      return {
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          // Appends TailwindCSS and AutoPrefixer.
          postcssOptions.plugins.push(require("tailwindcss"));
          postcssOptions.plugins.push(require("autoprefixer"));
          return postcssOptions;
        },
      };
    },

    // Glossary for production only. Comment the next line and uncomment `glossaryPlugin` to activate both modes.
    process.env.NODE_ENV === "production" && glossaryPlugin,
    // glossaryPlugin,
  ].filter(Boolean),
};

export default config;
