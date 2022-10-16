// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'iomete docs',
  tagline: 'The easy, low-cost Snowflake / Databricks alternative. Cloud, on prem and hybrid solutions.',
  url: 'https://iomete.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',

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

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').  Options} */
      ({
        // sitemap: {
        //   ignorePatterns: ['/docs/blog/**']
        // },
        docs: {
          routeBasePath: 'docs',
          sidebarPath: require.resolve('./sidebars.js')
          // autoCollapseCategories: false
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          routeBasePath: 'blog',
          blogSidebarCount: 'ALL',
          postsPerPage: 'ALL',
          blogTitle: 'iomete | Blog',
          showReadingTime: true,
          // blogListComponent: '/blog/index.js',
          blogTagsPostsComponent: require.resolve(
            "./src/theme/BlogListPage/index.tsx",
          ),
          blogSidebarTitle: 'All our posts',
          blogDescription: 'The blog of the easy, low-cost Snowflake / Databricks alternative. Data has been complex and expensive for too long. Learn how we make it easy and affordable.'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.scss'),
        },
        gtag: {
          trackingID: 'G-YMX75JE2MY',
          anonymizeIP: false
        }
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        // { name: 'keywords', content: 'iomete, datalake, lakehouse, warehouse, docs, documentation, sql editor, big data' },
        { name: 'og:image', content: 'https://iomete.com/docs/img/meta/open-graph.png' },
        { name: 'twitter:image', content: 'https://iomete.com/docs/img/meta/open-graph.png' },
        // {
        //   name: 'twitter:card',
        //   content: 'summary_large_image',
        // },
        // {
        //   name: 'twitter:domain',
        //   content: 'iomete.com',
        // },
        // {
        //   name: 'twitter:site',
        //   content: '@iomete',
        // },
        // {
        //   name: 'twitter:creator',
        //   content: 'iomete',
        // },
        {
          name: 'og:type',
          content: 'website',
        },
        {
          name: 'og:site_name',
          content: 'iomete Docs',
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
        hideOnScroll: true,
        logo: {
          alt: 'iomete logo',
          src: `/img/logo-black.svg`,
          srcDark: `/img/logo-white.svg`,
          href: '/docs',
          // target: '_blank',
          height: 42
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Docs',
          },
          {
            type: 'doc',
            docId: 'guides',
            label: 'Guides',
            position: 'left',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/iomete',
            label: 'GitHub',
            position: 'right'
          }
        ],
      },
      // footer: {
      //   style: 'light',
      //   links: [],
      //   copyright: `© ${new Date().getFullYear()} iomete`,
      // },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      // algolia: {
      //   appId: 'O9QSL985BS',
      //   apiKey: 'ceb5366064b8fbf70959827cf9f69227',
      //   indexName: 'ionicframework',
      //   contextualSearch: true,
      //   searchPagePath: 'search'
      // },
    }),
  plugins: [
    'docusaurus-plugin-sass'
  ]
};

module.exports = config;
