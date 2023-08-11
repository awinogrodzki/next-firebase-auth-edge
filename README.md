<picture>
  <source media="(prefers-color-scheme: dark)" srcset="logo-white.svg">
  <source media="(prefers-color-scheme: light)" srcset="logo.svg">
  <img alt="next-firebase-auth-edge" src="logo.svg">
</picture>

# next-firebase-auth-edge

Next.js 13 Firebase Authentication for Edge and Node.js runtimes. Dedicated for Next 13 server components. Compatible with Next.js middleware.

<a href="https://www.npmjs.com/package/next-firebase-auth-edge">![npm](https://nodei.co/npm/next-firebase-auth-edge.png)</a>

## Example

The starter demo is available at [next-firebase-auth-edge-starter.vercel.app](https://next-firebase-auth-edge-starter.vercel.app/)

You can find source code for the demo in [examples/next13-typescript-starter](https://github.com/ensite-in/next-firebase-auth-edge/tree/main/examples/next13-typescript-starter)

## Why

Official `firebase-admin` library relies heavily on Node.js internal `crypto` library and primitives that are unavailable inside [Next.js Edge Runtime](https://nextjs.org/docs/api-reference/edge-runtime).

This library aims to solve the problem of creating and verifying custom JWT tokens provided by **Firebase Authentication** using Web Crypto API available inside Edge runtimes

## Built on top of Web Crypto API

`next-firebase-auth-edge` is built upon [jose](https://github.com/panva/jose), _JavaScript module for JSON Object Signing and Encryption_ that works seamlessly in Edge and Node.js runtimes

## Table of Contents

- [Installation](#installation)
- [Overview](#overview)
  - [Middleware](#middleware)
    - [Options](#options)
      - [Required](#required)
      - [Optional](#optional)
  - [AuthProvider](#authprovider)
  - [Server Components](#server-components)
  - [API Routes or getServerSideProps](#api-routes-or-getserversideprops)
    - [API Route example](#api-route-example)
    - [GetServerSideProps example](#getserversideprops-example)
  - [Advanced usage](#advanced-usage)
    - [getFirebaseAuth](#getfirebaseauth)
      - [Methods](#methods)
    - [refreshAuthCookies in middleware](#refreshauthcookies-in-middleware)
    - [refreshAuthCookies in API Route](#refreshauthcookies-in-api-route)
    - [refreshAuthCookies in API handler](#refreshauthcookies-in-api-handler)
  - [Emulator support](#emulator-support)

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

## Overview

In order to set encrypted authentication cookies, we need to define server endpoints to handle logging in and logging out of users.

The library uses Next.js middleware to setup authentication endpoints, handle redirects and token revalidation.

All examples below are based on working Next.js 13 app examples found in [/examples](https://github.com/awinogrodzki/next-firebase-auth-edge/tree/main/examples) directory

### Middleware

```typescript
// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authentication } from "next-firebase-auth-edge/lib/next/middleware";

const PUBLIC_PATHS = ["/register", "/login", "/reset-password"];

function redirectToHome(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url);
}

function redirectToLogin(request: NextRequest) {
  if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `redirect=${request.nextUrl.pathname}${url.search}`;
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  return authentication(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: "YOUR-FIREBASE-API-KEY",
    cookieName: "AuthToken",
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: false, // set to 'true' on https environments
      sameSite: "lax",
      maxAge: 12 * 60 * 60 * 24, // twelve days
    },
    cookieSignatureKeys: ["secret1", "secret2"],
    serviceAccount: {
      projectId: "YOUR-FIREBASE-PROJECT-ID",
      clientEmail: "YOUR-FIREBASE-CLIENT-EMAIL",
      privateKey: "YOUR-FIREBASE-PRIVATE-KEY",
    },
    handleValidToken: async ({ token, decodedToken }) => {
      // Authenticated user should not be able to access /login, /register and /reset-password routes
      if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return redirectToHome(request);
      }

      return NextResponse.next();
    },
    handleInvalidToken: async () => {
      return redirectToLogin(request);
    },
    handleError: async (error) => {
      console.error("Unhandled authentication error", { error });
      return redirectToLogin(request);
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/((?!_next|favicon.ico|api|.*\\.).*)",
    "/api/login",
    "/api/logout",
  ],
};
```

#### Options

##### Required

| Name                   | Description                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| loginPath              | Defines API login endpoint. When called with auth firebase token from the client (see examples below), responds with `Set-Cookie` headers containing signed id and refresh tokens.               |
| logoutPath             | Defines API logout endpoint. When called from the client (see examples below), returns empty `Set-Cookie` headers that remove previously set credentials                                         |
| apiKey                 | Firebase project API key used to fetch firebase id and refresh tokens                                                                                                                            |
| cookieName             | The name for cookie set by `loginPath` api route.                                                                                                                                                |
| cookieSignatureKeys    | [Rotating keys](https://developer.okta.com/docs/concepts/key-rotation/#:~:text=Key%20rotation%20is%20when%20a,and%20follows%20cryptographic%20best%20practices.) the cookie is validated against |
| cookieSerializeOptions | Defines additional cookie options sent along `Set-Cookie` headers                                                                                                                                |
| serviceAccount         | Firebase project service account                                                                                                                                                                 |

##### Optional

| Name               | Type                                                                                                                          | Description                                                                                                                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| checkRevoked       | `boolean` By default `false`                                                                                                  | If true, validates the token against firebase server on each request. Unless you have a good reason, it's better not to use it.                                                                                                                      |
| handleValidToken   | `(tokens: { token: string, decodedToken: DecodedIdToken }) => Promise<NextResponse>` By default returns `NextResponse.next()` | Receives id and decoded tokens and should return a promise that resolves with NextResponse.                                                                                                                                                          |
| handleInvalidToken | `() => Promise<NextResponse>` By default returns `NextResponse.next()`                                                        | If passed, is called and returned if request has not been authenticated (either does not have credentials attached or credentials have expired). Can be used to redirect unauthenticated users to specific page or pages.                            |
| handleError        | `(error: unknown) => Promise<NextResponse>` By default returns `NextResponse.next()`                                          | Receives an unhandled error that happened during authentication and should resolve with NextResponse. By default, in case of unhandled error during authentication, we just allow application to render. This allows you to customize error handling |

#### Troubleshooting

##### error - Too big integer

One of the common issues during setup is `error - Too big integer` thrown by `crypto-signer`. If you stumble on it, please make sure to follow resolution mentioned in https://github.com/awinogrodzki/next-firebase-auth-edge/issues/17#issuecomment-1376298292

The error is caused by malformed firebase private key. We are working on providing correct private key validation and more user friendly error message. Until then, please follow the quick fix in aforementioned issue comment.

### Login and logout using Firebase

`GET /api/login` endpoint should be called with firebase token (see examples below). It responds with `Set-Cookie` header containing signed cookies.

`GET /api/logout` removes authentication cookies. Make sure to sign out the user from firebase before calling the endpoint.

```tsx
// app/login/page.tsx
"use client";

import * as React from "react";
import { useFirebaseAuth } from "../../auth/firebase";
import { PasswordFormValue } from "../../ui/PasswordForm/PasswordForm";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

export default function LoginPage() {
  const { getFirebaseAuth } = useFirebaseAuth();

  async function handleLoginWithEmailAndPassword({
    email,
    password,
  }: PasswordFormValue) {
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idTokenResult = await credential.user.getIdTokenResult();
    // Sets authenticated cookies
    await fetch("/api/login", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idTokenResult.token}`,
      },
    });
  }

  async function handleLogout() {
    const auth = getFirebaseAuth();
    await signOut(auth);
    // Removes authenticated cookies
    await fetch("/api/logout", {
      method: "GET",
    });
    window.location.reload();
  }

  return <form>...</form>;
}
```

### AuthProvider

Usually, we need some way to share user data across the application. Below is a custom implementation for AuthProvider from [examples/next13-typescript-starter](https://github.com/ensite-in/next-firebase-auth-edge/tree/main/examples/next13-typescript-starter) that builds on top of React context.

You can see a working demo at [next-firebase-auth-edge-starter.vercel.app](https://next-firebase-auth-edge-starter.vercel.app/)

The source code for the demo can be found here [examples/next13-typescript-starter](https://github.com/ensite-in/next-firebase-auth-edge/tree/main/examples/next13-typescript-starter)

```tsx
// client-auth-provider.tsx
"use client";

import * as React from "react";
import {
  IdTokenResult,
  onIdTokenChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { useFirebaseAuth } from "./firebase";
import { AuthContext, User } from "./context";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/claims";

export interface AuthProviderProps {
  defaultUser: User | null;
  children: React.ReactNode;
}

function toUser(user: FirebaseUser, idTokenResult: IdTokenResult): User {
  return {
    ...user,
    customClaims: filterStandardClaims(idTokenResult.claims),
  };
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  defaultUser,
  children,
}) => {
  const { getFirebaseAuth } = useFirebaseAuth();
  const [user, setUser] = React.useState(defaultUser);

  const handleIdTokenChanged = async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    const idTokenResult = await firebaseUser.getIdTokenResult();

    setUser(toUser(firebaseUser, idTokenResult));
  };

  const registerChangeListener = async () => {
    const auth = getFirebaseAuth();
    return onIdTokenChanged(auth, handleIdTokenChanged);
  };

  React.useEffect(() => {
    const unsubscribePromise = registerChangeListener();

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### Server Components

`next-firebase-auth-edge` is designed to work with [React Server Components](https://nextjs.org/docs/advanced-features/react-18/server-components) and Next.js 13.

Below is an example of root `app/layout.tsx` server component using `getTokens` function to extract user tokens from request cookies

```tsx
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { cookies } from "next/headers";
import { AuthProvider } from "./auth-provider";
import { Tokens } from "next-firebase-auth-edge/lib/auth";
import { UserInfo } from "firebase/auth";

const mapTokensToUser = ({ decodedToken }: Tokens): UserInfo => {
  const {
    uid,
    email,
    picture: photoURL,
    email_verified: emailVerified,
    phone_number: phoneNumber,
    name: displayName,
  } = decodedToken;

  return {
    uid,
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    phoneNumber: phoneNumber ?? null,
    emailVerified: emailVerified ?? false,
    provider: "firebase",
  };
};

//...
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tokens = await getTokens(cookies(), {
    apiKey: "firebase-api-key",
    serviceAccount: {
      projectId: "firebase-project-id",
      privateKey: "firebase service account private key",
      clientEmail: "firebase service account client email",
    },
    cookieName: "AuthToken",
    cookieSignatureKeys: ["secret1", "secret2"],
  });

  const user = tokens ? mapTokensToUser(tokens) : null;

  return (
    <html lang="en">
      <head />
      <body>
        <AuthProvider defaultUser={user}>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

### API Routes or getServerSideProps

Library provides `getTokensFromObject` function that allows us to authenticate users inside API routes or getServerSideProps.

#### API Route example

```typescript
import { NextApiRequest, NextApiResponse } from "next";
import { getTokensFromObject } from "next-firebase-auth-edge/lib/next/tokens";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const tokens = await getTokensFromObject(req.cookies, {
    apiKey: "firebase-api-key",
    cookieName: "AuthToken",
    cookieSignatureKeys: ["secret1", "secret2"],
    serviceAccount: {
      projectId: "firebase-project-id",
      privateKey: "firebase service account private key",
      clientEmail: "firebase service account client email",
    },
  });

  return res.status(200).json({ tokens });
}
```

#### GetServerSideProps example

```typescript
import { GetServerSidePropsContext } from "next";
import { getTokensFromObject } from "next-firebase-auth-edge/lib/next/tokens";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const tokens = await getTokensFromObject(context.req.cookies, {
    apiKey: "firebase-api-key",
    cookieName: "AuthToken",
    cookieSignatureKeys: ["secret1", "secret2"],
    serviceAccount: {
      projectId: "firebase-project-id",
      privateKey: "firebase service account private key",
      clientEmail: "firebase service account client email",
    },
  });

  return { props: {} };
}
```

### Advanced usage

Authentication middleware might not fully support every use-case. To help you with more complex authentication flows, `next-firebase-auth-edge` provides a set of low-level building blocks.

#### getFirebaseAuth

```typescript
const {
  getCustomIdAndRefreshTokens,
  verifyIdToken,
  createCustomToken,
  handleTokenRefresh,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  verifyAndRefreshExpiredIdToken,
  setCustomUserClaims,
} = getFirebaseAuth(
  {
    projectId: "firebase-project-id",
    privateKey: "firebase service account private key",
    clientEmail: "firebase service account client email",
  },
  "firebase-api-key"
);
```

##### Methods

| Name                           | Type                                                                       | Description                                                                                                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------- |-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| getCustomIdAndRefreshTokens    | `(idToken: string, firebaseApiKey: string) => Promise<IdAndRefreshTokens>` | Generates a new set of id and refresh tokens for user identified by provided `idToken`                                                                                              |
| verifyIdToken                  | `(idToken: string, checkRevoked?: boolean) => Promise<DecodedIdToken>`     | Verifies provided `idToken`. Throws `AuthError`. See [source code](https://github.com/awinogrodzki/next-firebase-auth-edge/blob/main/src/auth/error.ts) for possible error types.                                                                                      |
| createCustomToken              | `(uid: string, developerClaims?: object) => Promise<string>`               | Creates a custom token for given firebase user. Optionally, it's possible to attach additional `developerClaims`                                                                    |
| handleTokenRefresh             | `(refreshToken: string, firebaseApiKey: string) => Promise<Tokens>`        | Returns id `token` and `decodedToken` for given `refreshToken`                                                                                                                      |
| getUser                        | `(uid: string) => Promise<UserRecord>`                                     | Returns Firebase UserRecord by uid                                                                                                                                                  |
| createUser                     | `(request: CreateRequest) => Promise<UserRecord>`                          | Creates user and returns UserRecord. See official firebase [Create a user](https://firebase.google.com/docs/auth/admin/manage-users#create_a_user) docs for request examples        |
| updateUser                     | `(uid: string, request: UpdateRequest) => Promise<UserRecord>`             | Updates user by uid and returns UserRecord. See official firebase [Update a user](https://firebase.google.com/docs/auth/admin/manage-users#update_a_user) docs for request examples |
| deleteUser                     | `(uid: string) => Promise<void>`                                           | Deletes user                                                                                                                                                                        |
| setCustomUserClaims            | `(uid: string, customClaims: object ∣ null) => Promise<void>`              | Sets custom claims for given user. Overwrites existing values. Use `getUser` to fetch current claims                                                                                |
| verifyAndRefreshExpiredIdToken | `(token: string, refreshToken: string) => Promise<Tokens ∣ null>`          | Verifies provided `idToken`. If token is expired, uses `refreshToken` to validate it. Returns `null` if token is not valid.                                                         |

#### refreshAuthCookies in middleware

Can be used inside Next.js Edge runtime to refresh user's authentication cookies. Useful when we want to refresh credentials after updating [custom claims](https://firebase.google.com/docs/auth/admin/custom-claims) with `setCustomUserClaims` function

Usage in [starter example](https://github.com/awinogrodzki/next-firebase-auth-edge/blob/main/examples/next13-typescript-starter/app/api/custom-claims/route.ts)

Using refreshAuthCookies automatically sets Set-Cookie headers with updated cookies in response. Additionally, it returns a set of updated idToken and refreshToken, in case you want to do something with it

```typescript
// middleware.ts
import type { NextRequest } from "next/server";
import {
  authentication,
  refreshAuthCookies,
} from "next-firebase-auth-edge/lib/next/middleware";
import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";

const commonOptions = {
  apiKey: "firebase-api-key",
  cookieName: "AuthToken",
  cookieSignatureKeys: ["secret1", "secret2"],
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: false, // Set this to true on HTTPS environments
    sameSite: "strict" as const,
    maxAge: 12 * 60 * 60 * 24, // twelve days
  },
  serviceAccount: {
    projectId: "firebase-project-id",
    privateKey: "firebase service account private key",
    clientEmail: "firebase service account client email",
  },
};

const { setCustomUserClaims, getUser } = getFirebaseAuth(
  commonOptions.serviceAccount,
  commonOptions.apiKey
);

export async function middleware(request: NextRequest) {
  return authentication(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    handleValidToken: async ({ token, decodedToken }) => {
      if (request.nextUrl.pathname === "/api/custom-claims") {
        await setCustomUserClaims(decodedToken.uid, {
          someClaims: ["someValue"],
        });

        const user = await getUser(decodedToken.uid);
        const response = new NextResponse(JSON.stringify(user.customClaims), {
          status: 200,
          headers: { "content-type": "application/json" },
        });

        await refreshAuthCookies(token, response, commonOptions);
        return response;
      }

      return NextResponse.next();
    },
    ...commonOptions,
  });
}

export const config = {
  matcher: [
    "/",
    "/((?!_next|favicon.ico|api|.*\\.).*)",
    "/api/login",
    "/api/logout",
  ],
};
```

#### refreshAuthCookies in API Route

Based on `/api/custom-claims` endpoint found in [starter examle](https://github.com/awinogrodzki/next-firebase-auth-edge/blob/main/examples/next13-typescript-starter/app/api/custom-claims/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "../../../config/server-config";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { refreshAuthCookies } from "next-firebase-auth-edge/lib/next/middleware";
import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";

const { setCustomUserClaims, getUser } = getFirebaseAuth(
  authConfig.serviceAccount,
  authConfig.apiKey
);

export async function POST(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

  if (!tokens) {
    throw new Error("Cannot update custom claims of unauthenticated user");
  }

  await setCustomUserClaims(tokens.decodedToken.uid, {
    someCustomClaim: {
      updatedAt: Date.now(),
    },
  });

  const user = await getUser(tokens.decodedToken.uid);
  const response = new NextResponse(
    JSON.stringify({
      customClaims: user.customClaims,
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );

  // Attach `Set-Cookie` headers with token containing new custom claims
  await refreshAuthCookies(tokens.token, response, authConfig);

  return response;
}
```

#### refreshAuthCookies in API handler

Can be used inside Next.js API routes to refresh user's authentication cookies. Useful when we want to refresh credentials after updating [custom claims](https://firebase.google.com/docs/auth/admin/custom-claims) or user profile data

Using refreshAuthCookies automatically sets Set-Cookie headers with updated cookies in api response. Additionally, it returns a set of updated idToken and refreshToken, in case you want to do something with it

```typescript
// pages/api/refresh-tokens.ts
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { serverConfig } from "../../config/server-config";
import { refreshAuthCookies } from "next-firebase-auth-edge/lib/next/cookies";
import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const bearerToken = req.headers["authorization"]?.split(" ")[1] ?? "";

  // ...use bearer token to update custom claims using "firebase-admin" library and then:

  const { idToken, refreshToken } = await refreshAuthCookies(bearerToken, res, {
    serviceAccount: {
      projectId: "firebase-project-id",
      privateKey: "firebase service account private key",
      clientEmail: "firebase service account client email",
    },
    apiKey: "firebase-api-key",
    cookieName: "AuthToken",
    cookieSignatureKeys: ["secret1", "secret2"],
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: false, // Set this to true on HTTPS environments
      sameSite: "strict" as const,
      maxAge: 12 * 60 * 60 * 24, // twelve days
    },
  });

  // Optionally do something with new `idToken` and `refreshToken`

  res.status(200).json({ example: true });
}
```

Make sure to call the endpoint with correct `Authorization` headers:

```typescript
await fetch("/api/refresh-tokens", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${idToken}`,
  },
});
```

### Emulator support

Library provides Firebase Authentication Emulator support. Follow starter example readme [examples/next13-typescript-starter](examples/next13-typescript-starter)
