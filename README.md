<picture>
  <source media="(prefers-color-scheme: dark)" srcset="logo-white.svg">
  <source media="(prefers-color-scheme: light)" srcset="logo.svg">
  <img alt="next-firebase-auth-edge" src="logo.svg" width="320">
</picture>

---

Next.js Firebase Authentication for Edge and Node.js runtimes. Use Firebase Authentication with latest Next.js features.

[![npm version](https://badge.fury.io/js/next-firebase-auth-edge.svg)](https://badge.fury.io/js/next-firebase-auth-edge)

## Example

Check out a working demo here: [next-firebase-auth-edge-starter.vercel.app](https://next-firebase-auth-edge-starter.vercel.app/)

You can find the source code for this demo at [examples/next-typescript-starter](https://github.com/ensite-in/next-firebase-auth-edge/tree/main/examples/next-typescript-starter)

## Featured in
<a href="https://ensite.in">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="images/ensite-logo-horizontal-white.svg">
    <source media="(prefers-color-scheme: light)" srcset="images/ensite-logo-horizontal.svg">
    <img alt="ensite.in" src="images/ensite-logo-horizontal.svg" height="24">
  </picture>
</a>

a no code web editor


## Guide

New to Firebase or Next.js? No worries! Follow this easy, step-by-step guide to set up Firebase Authentication in Next.js app using the **next-firebase-auth-edge** library:

https://hackernoon.com/using-firebase-authentication-with-the-latest-nextjs-features

## Docs

The official documentation is available here: https://next-firebase-auth-edge-docs.vercel.app

## Why?

The official `firebase-admin` library depends heavily on Node.js’s internal `crypto` library, which isn’t available in [Next.js Edge Runtime](https://nextjs.org/docs/api-reference/edge-runtime).

This library solves that problem by handling the creation and verification of [Custom ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens) using the Web Crypto API, which works in Edge runtimes.

## Features

`next-firebase-auth-edge` supports all the latest Next.js features, like the [App Router](https://nextjs.org/docs/app) and [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components).

To make adopting the newest Next.js features easier, this library works seamlessly with both [getServerSideProps](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props) and legacy [API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes).

### Key Features:
* **Supports Next.js's latest features**
* **Zero bundle size**
* **Minimal setup**: Unlike other libraries, you won’t need to create your own API routes or modify your `next.config.js`. Everything’s handled by [middleware](https://next-firebase-auth-edge-docs.vercel.app/docs/usage/middleware).
* **Secure**: Uses [jose](https://github.com/panva/jose) for JWT validation, and signs user cookies with rotating keys to prevent cryptanalysis attacks.

### What's New in v1.8

Key updates in this release include:
* Custom token is now optional. To enable custom token support use [enableCustomToken](https://next-firebase-auth-edge-docs.vercel.app/docs/usage/middleware#custom-token) option
* Support ESM, Browser and Node.js imports for better tree-shaking features
* Support for **Node.js 22**
* Support for **Next.js 15 RC**
* Support for **React 19**
* New `experimental_enableTokenRefreshOnExpiredKidHeader` option in `authMiddleware` and `getTokens`, which refreshes user tokens when Google’s public certificates expire (instead of throwing an error)


## Installation

To install, run one of the following:

With **npm**

```shell
npm install next-firebase-auth-edge
```

With **yarn**

```shell
yarn add next-firebase-auth-edge
```

With **pnpm**

```shell
pnpm add next-firebase-auth-edge
```

## [→ Read the docs](https://next-firebase-auth-edge-docs.vercel.app/)
