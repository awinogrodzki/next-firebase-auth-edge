<picture>
  <source media="(prefers-color-scheme: dark)" srcset="logo-white.svg">
  <source media="(prefers-color-scheme: light)" srcset="logo.svg">
  <img alt="next-firebase-auth-edge" src="logo.svg" width="320">
</picture>

---

Next.js Firebase Authentication for Edge and Node.js runtimes. Use Firebase Authentication with latest Next.js features.

[![npm version](https://badge.fury.io/js/next-firebase-auth-edge.svg)](https://badge.fury.io/js/next-firebase-auth-edge)

## Example

The starter demo is available at [next-firebase-auth-edge-starter.vercel.app](https://next-firebase-auth-edge-starter.vercel.app/)

You can find source code for the demo in [examples/next-typescript-starter](https://github.com/ensite-in/next-firebase-auth-edge/tree/main/examples/next-typescript-starter)

## Guide

If you're new to Firebase or Next.js, you can follow this comprehensive, step-by-step guide on integrating Firebase Authentication with Next.js using **next-firebase-auth-edge** library: 

https://hackernoon.com/using-firebase-authentication-with-the-latest-nextjs-features

## Docs

Official library documentation can be found at https://next-firebase-auth-edge-docs.vercel.app

## Why

Official `firebase-admin` library relies heavily on Node.js internal `crypto` library and primitives that are unavailable inside [Next.js Edge Runtime](https://nextjs.org/docs/api-reference/edge-runtime).

This library aims to solve the problem of creating and verifying [Custom ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens) using Web Crypto API available inside Edge runtimes.

## Features

`next-firebase-auth-edge` is compatible with latest Next.js features, such as [App Router](https://nextjs.org/docs/app) or [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

To allow gradual adoption of latest Next.js features, `next-firebase-auth-edge` works interchangeably with [getServerSideProps](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props) and legacy [Api Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

* **Supports latest Next.js features**
* **Zero-bundle size**
* **Minimal configuration**: In contrary to other libraries, you don't have to define your own API routes or update your `next.config.js` file. All heavy lifting is done by [the middleware](https://next-firebase-auth-edge-docs.vercel.app/docs/usage/middleware).
* **Secure**: Uses [jose](https://github.com/panva/jose) for JWT validation. Signs user cookies with rotating keys to mitigate the risk of cryptanalysis attacks

### What's new in v1.7

Most notable features are:
* **Node.js 22** support
* **Next.js 15 RC** support
* **React 19** support
* Introduced `experimental_enableTokenRefreshOnExpiredKidHeader` option in `authMiddleware` and `getTokens` to refresh user token instead of throwing an error when Google public certificates have expired
* Introduced `authorizationHeaderName` option in `authMiddleware` to customize login endpoint authorization header name
* Introduced `redirectToPath` helper function to redirect users to any path from inside Middleware
* Updated `redirectToLogin` helper function to accept `RegExp` in `publicPaths`

See [1.7.x canary release](https://github.com/awinogrodzki/next-firebase-auth-edge/pull/216) for detailed description



## Installation

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
