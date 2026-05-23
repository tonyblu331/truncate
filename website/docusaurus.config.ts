import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';

const config: Config = {
  title: 'truncate',
  tagline: 'DOM-free text truncation',
  favicon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⌨</text></svg>',

  url: 'https://tonyblu331.github.io',
  baseUrl: '/truncate/',

  organizationName: 'tonyblu331',
  projectName: 'truncate',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: false,
        pages: {
          path: 'src/pages',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies any,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      hideOnScroll: false,
      style: 'dark',
      title: 'truncate',
      logo: {
        alt: 'truncate',
        src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⌨</text></svg>',
      },
      items: [
        {to: '/', label: 'Playground', position: 'left'},
        {
          href: 'https://github.com/tonyblu331/truncate',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `MIT © ${new Date().getFullYear()} Antonio Bonet K Antonio Bonet`,
    },
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
    },
  } satisfies any,
};

export default config;
