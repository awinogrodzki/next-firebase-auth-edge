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
  ],
});
