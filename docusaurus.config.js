// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
const path = require('path');

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'iomete docs',
  tagline: 'The easy, low-cost Snowflake / Databricks alternative. Cloud, on prem and hybrid solutions.',
  url: 'https://www.iomete.com/',
  baseUrl: '/',
  // baseUrl: '/docs/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'icons/iom-dark.svg',

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
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // breadcrumbs: false,
          showLastUpdateTime: true,
        },
        blog: {
          // showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/styles/custom.scss'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        sidebar: {
          hideable: true,
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
          href: 'https://www.iomete.com',
          target: '_blank',
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
          },
          {
            type: 'search',
            position: 'right',
          },
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
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus'
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
      algolia: {
        appId: 'O9QSL985BS',
        apiKey: 'ceb5366064b8fbf70959827cf9f69227',
        indexName: 'ionicframework',
        contextualSearch: true,
        searchPagePath: 'search'
      },
    }),
    plugins:[
      'docusaurus-plugin-sass',
    ]
};

module.exports = config;
