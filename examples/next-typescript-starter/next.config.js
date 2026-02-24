const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  // Needed for `signInWithRedirect` and custom `authDomain` configuration. See https://firebase.google.com/docs/auth/web/redirect-best-practices#proxy-requests
  // If you don't plan to use `signInWithRedirect` or custom `authDomain`, you can safely remove `rewrites` config.
  async rewrites() {
    return [
      {
        source: '/__/auth',
        destination: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com/__/auth`
      },
      {
        source: '/__/auth/:path*',
        destination: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com/__/auth/:path*`
      },
      {
        source: '/__/firebase/init.json',
        destination: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com/__/firebase/init.json`
      }
    ];
  },
  typescript: {
    // Type conflicts are expected with `link:` dependencies due to duplicate
    // `next` installations using `unique symbol` in type declarations.
    // This does not affect real consumers who install the package from npm.
    ignoreBuildErrors: true,
  },
  env: {
    VERCEL: process.env.VERCEL
  }
};

module.exports = nextConfig;
