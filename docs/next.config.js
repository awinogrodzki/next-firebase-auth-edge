const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  staticImage: true,
  defaultShowCopyCode: true,
  flexsearch: {
    codeblocks: false
  }
});

module.exports = withNextra({
  redirects: () => [
    // Index pages
    {
      source: '/docs',
      destination: '/docs/getting-started',
      permanent: false
    },
    // Legacy pages
    {
      source: '/docs/usage/refresh-auth-cookies',
      destination: '/docs/usage/refresh-credentials',
      permanent: true
    },
  ],
});
