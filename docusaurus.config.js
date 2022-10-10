// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
const path = require('path');

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'iomete docs',
  tagline: 'The easy, low-cost Snowflake / Databricks alternative. Cloud, on prem and hybrid solutions.',
  url: 'https://iomete.com',
  baseUrl: '/docs/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'icons/iom-dark.png',

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
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        sitemap: {
          ignorePatterns: ['/docs/blog/**']
        },
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // breadcrumbs: false,
          showLastUpdateTime: true
        },
        blog: {
          routeBasePath: 'blog',
          blogSidebarCount: 'ALL',
          postsPerPage: 'ALL',
          blogTitle: 'iomete | Blog',
          // blogListComponent: '/blog/index.js',
          blogSidebarTitle: 'All our posts',
          blogDescription: 'The blog of the easy, low-cost Snowflake / Databricks alternative. Data has been complex and expensive for too long. Learn how we make it easy and affordable.'
        },
        theme: {
          customCss: require.resolve('./src/styles/custom.scss'),
        },
        // googleAnalytics: {
        //   trackingID: 'G-QL2LE4R9FS',
        // },
        gtag: {
          trackingID: 'G-QL2LE4R9FS'
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
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:domain',
          content: 'iomete.com',
        },
        {
          name: 'twitter:site',
          content: '@iomete',
        },
        {
          name: 'twitter:creator',
          content: 'iomete',
        },
        // {
        //   name: 'fb:page_id',
        //   content: '1321836767955949',
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
      // announcementBar: {
      //   id: 'support_us',
      //   content:
      //     '⭐️ If you like iomete, give it a star on  <a target="_blank" rel="noopener noreferrer" href="#">GitHub</a> and follow us on <a target="_blank" rel="noopener noreferrer" href="#">Twitter</a>',
      //   backgroundColor: '#fafbfc',
      //   textColor: 'black',
      // },
      docs: {
        sidebar: {
          // hideable: true,
          // autoCollapseCategories: true
        }
      },
      navbar: {
        // title: 'docs',
        hideOnScroll: true,
        logo: {
          alt: 'iomete logo',
          src: `/logos/logo-black.svg`,
          srcDark: `/logos/logo-white.svg`,
          href: '/',
          // target: '_blank',
          height: 42
        },
        items: [
          {
            type: 'doc',
            docId: 'docs',
            position: 'left',
            label: 'Docs',
          },
          {
            type: 'doc',
            docId: 'how-to',
            label: 'Guides',
            position: 'left',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/iomete',
            label: 'GitHub',
            position: 'right'
          },
          // {
          //   type: 'search',
          //   position: 'right',
          // },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Docs',
                to: '/docs',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Linkedin',
                href: 'https://www.linkedin.com/company/iomete',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/iometedata',
              },
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/iomete',
              },
            ],
          },
          {
            title: 'More',
            items: [
              // {
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: 'GitHub',
                href: 'https://github.com/iomete'
              },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} iomete`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
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
    'docusaurus-plugin-sass',
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
    }
  ]
};

module.exports = config;
