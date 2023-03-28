# next-firebase-auth-edge

Next.js 13 Firebase Authentication for Edge and server runtimes. Dedicated for Next 13 server components. Compatible with Next.js middleware.

## Example

The demo is available at [next-firebase-auth-edge-static-demo.vercel.app](https://next-firebase-auth-edge-static-demo.vercel.app/)

You can find source code for the demo in [examples/next13-typescript-static-pages](https://github.com/ensite-in/next-firebase-auth-edge/tree/main/examples/next13-typescript-static-pages)

## Why

Official `firebase-admin` library relies heavily on Node.js internal `crypto` library and primitives that are unavailable inside [Next.js Edge Runtime](https://nextjs.org/docs/api-reference/edge-runtime).

This library aims to solve the problem of creating and verifying custom JWT tokens provided by **Firebase Authentication** using Web Crypto API available inside Edge runtimes

## What's new in v0.4.x

In recent release, there has been some important optimisations in terms of the number of network round-trips and response times.

Thereby, using `getTokens` in `middleware.ts` is no longer recommended. Please see [Authentication middleware](https://github.com/awinogrodzki/next-firebase-auth-edge#authentication-middleware) section to migrate to version 0.4.x

You can still use `getTokens` in server components. `getTokens` works in tandem with `authentication` middleware function providing further improvements to response times.

## Built on top of Web Crypto API

`next-firebase-auth-edge` is built entirely upon [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). Although it seems fine at first, please remember that it is still in an experimental stage. Any feedback or contribution is welcome.

Node.js polyfill for Web Crypto is provided by [@peculiar/webcrypto](https://github.com/PeculiarVentures/webcrypto)

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

## Usage

Before using this module ensure that you have enabled `appDir` experimental option in your `next.config.js`:

```javascript
module.exports = {
  experimental: {
    appDir: true,
  },
};
```

### Authentication middleware

In order to set encrypted authentication cookies, we need to define server endpoints to handle logging in and logging out of users.

This can be achieved quite easily using the authentication middleware function:

All examples below are based on working Next.js 13 app examples found in [/examples](https://github.com/awinogrodzki/next-firebase-auth-edge/tree/main/examples) directory

```typescript
// middleware.ts
import type { NextRequest } from "next/server";
import { authentication } from "next-firebase-auth-edge/lib/next/middleware";

export async function middleware(request: NextRequest) {
  return authentication(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: "firebase-api-key",
    cookieName: "AuthToken",
    cookieSignatureKeys: ["secret1", "secret2"],
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: false, // Set this to true on HTTPS environments
      sameSite: "strict" as const,
      maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
    },
    serviceAccount: {
      projectId: "firebase-project-id",
      privateKey: "firebase service account private key",
      clientEmail: "firebase service account client email",
    },
    // Optional
    isTokenValid: (token) => token.email_verified ?? false,
    checkRevoked: false,
    handleValidToken: async ({ token, decodedToken }) => {
      console.log("Successfully authenticated", { token, decodedToken });
      return NextResponse.next();
    },
    handleInvalidToken: async () => {
      // Avoid redirect loop
      if (request.nextUrl.pathname === "/login") {
        return NextResponse.next();
      }

      // Redirect to /login?redirect=/prev-path when request is unauthenticated
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `redirect=${request.nextUrl.pathname}${url.search}`;
      return NextResponse.redirect(url);
    },
    handleError: async (error) => {
      console.error("Unhandled authentication error", { error });
      // Avoid redirect loop
      if (request.nextUrl.pathname === "/login") {
        return NextResponse.next();
      }

      // Redirect to /login?redirect=/prev-path on unhandled authentication error
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `redirect=${request.nextUrl.pathname}${url.search}`;
      return NextResponse.redirect(url);
    },
  });
}

export const config = {
  matcher: ["/", "/((?!_next/static|favicon.ico|logo.svg).*)"],
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

| Name               | Type                                                                                                                                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| redirectOptions    | `{ path: string, paramName: string }` By default `undefined`                                                                                     | Pass if you want to enable redirect to dedicated authentication page. Defines redirect `path` and `paramName` for non-authenticated requests. For example, assuming the `path` is `/login` and `paramName` is `redirect`, if unauthorized user tries to access `/ultra-secure` route, they'd be redirected to `/login?redirect=/ultra-secure`. **This option is deprecated and will be replaced with `handleInvalidToken` defined below.** |
| isTokenValid       | `(token: DecodedIdToken) => boolean` By default returns `true` for tokens with `email_verified: true`                                            | Tells the middleware whether user token is valid for the current route. It can be used to deal with custom permissions.                                                                                                                                                                                                                                                                                                                    |
| checkRevoked       | `boolean` By default `false`                                                                                                                     | If true, validates the token against firebase server on each request. Unless you have a good reason, it's better not to use it.                                                                                                                                                                                                                                                                                                            |
| handleValidToken   | `(tokens: { token: string, decodedToken: DecodedIdToken }) => Promise<NextResponse>` By default returns `NextResponse.next()`                    | Receives id and decoded tokens and should return a promise that resolves with NextResponse.                                                                                                                                                                                                                                                                                                                                                |
| handleInvalidToken | `() => Promise<NextResponse>` By default returns `NextResponse.next()` or redirects to login page if `redirectOptions` are present               | If passed, is called and returned if user has not been authenticated with `isTokenValid` or there are no credentials in request cookies. Can be used to redirect unauthenticated users to specific page or pages. **Cannot be used together with redirectOptions**                                                                                                                                                                         |
| handleError        | `(error: unknown) => Promise<NextResponse>` By default returns `NextResponse.next()` or redirects to login page if `redirectOptions` are present | Receives an unhandled error that happened during authentication and should resolve with NextResponse. By default, in case of unhandled error during authentication, we just redirect user to the login page. This allows you to customize error handling                                                                                                                                                                                   |

#### Troubleshooting

##### error - Too big integer

One of the common issues during setup is `error - Too big integer` thrown by `crypto-signer`. If you stumble on it, please make sure to follow resolution mentioned in https://github.com/awinogrodzki/next-firebase-auth-edge/issues/17#issuecomment-1376298292

The error is caused by malformed firebase private key. We are working on providing correct private key validation and more user friendly error message. Until then, please follow the quick fix in aforementioned issue comment.

### Example AuthProvider

Below is example implementation of custom AuthProvider component that handles the calling of authentication endpoints.

`GET /api/login` endpoint should be called with firebase token (see examples below). It responds with `Set-Cookie` header containing encrypted cookies.

`GET /api/logout` removes authentication cookies. Make sure to sign out the user from firebase before calling the endpoint.

You can see a working demo at [next-firebase-auth-edge-static-demo.vercel.app](https://next-firebase-auth-edge-static-demo.vercel.app/)

The source code for the demo can be found here [examples/next13-typescript-static-pages](https://github.com/ensite-in/next-firebase-auth-edge/tree/main/examples/next13-typescript-static-pages)

```tsx
export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  defaultTenant,
  children,
}) => {
  const { getFirebaseAuth } = useFirebaseAuth(clientConfig);
  const firstLoadRef = React.useRef(true);
  const [tenant, setTenant] = React.useState(defaultTenant);

  // Call logout any time
  const handleLogout = async () => {
    const auth = await getFirebaseAuth();
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    // Removes authentication cookies
    await fetch("/api/logout", {
      method: "GET",
    });
  };

  const handleIdTokenChanged = async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser && tenant && firebaseUser.uid === tenant.id) {
      firstLoadRef.current = false;
      return;
    }

    const auth = await getFirebaseAuth();

    if (!firebaseUser && firstLoadRef.current) {
      const { signInAnonymously } = await import("firebase/auth");
      firstLoadRef.current = false;
      await signInAnonymously(auth);
      return;
    }

    if (!firebaseUser) {
      firstLoadRef.current = false;
      startTransition(() => {
        setTenant(null);
      });
      return;
    }

    firstLoadRef.current = false;
    const tokenResult = await firebaseUser.getIdTokenResult();
    // Sets authentication cookies
    await fetch("/api/login", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenResult.token}`,
      },
    });
    startTransition(() => {
      setTenant(mapFirebaseResponseToTenant(tokenResult, firebaseUser));
    });
  };

  const registerChangeListener = async () => {
    const auth = await getFirebaseAuth();
    const { onIdTokenChanged } = await import("firebase/auth");
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
        tenant,
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
import "./globals.css";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { cookies } from "next/headers";
import { AuthProvider } from "./auth-provider";
import { serverConfig } from "./server-config";
import { Tokens } from "next-firebase-auth-edge/lib/auth";
import { Tenant } from "../auth/types";

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

  const tenant = tokens ? mapTokensToTenant(tokens) : null;

  return (
    <html lang="en">
      <head />
      <body>
        <AuthProvider defaultTenant={tenant}>{children}</AuthProvider>
      </body>
    </html>
  );
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

| Name                           | Type                                                                       | Description                                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| getCustomIdAndRefreshTokens    | `(idToken: string, firebaseApiKey: string) => Promise<IdAndRefreshTokens>` | Generates a new set of id and refresh tokens for user identified by provided `idToken`                                      |
| verifyIdToken                  | `(idToken: string, checkRevoked?: boolean) => Promise<DecodedIdToken>`     | Verifies provided `idToken`. Throws `FirebaseAuthError`. See source code for possible error types.                          |
| createCustomToken              | `(uid: string, developerClaims?: object) => Promise<string>`               | Creates a custom token for given firebase user. Optionally, it's possible to attach additional `developerClaims`            |
| handleTokenRefresh             | `(refreshToken: string, firebaseApiKey: string) => Promise<Tokens>`        | Returns id `token` and `decodedToken` for given `refreshToken`                                                              |
| getUser                        | `(uid: string) => Promise<UserRecord>`                                     | Returns Firebase UserRecord by uid                                                                                          |
| deleteUser                     | `(uid: string) => Promise<void>`                                           | Deletes user                                                                                                                |
| setCustomUserClaims            | `(uid: string, customClaims: object ∣ null) => Promise<void>`              | Sets custom claims for given user. Overwrites existing values. Use `getUser` to fetch current claims                        |
| verifyAndRefreshExpiredIdToken | `(token: string, refreshToken: string) => Promise<Tokens ∣ null>`          | Verifies provided `idToken`. If token is expired, uses `refreshToken` to validate it. Returns `null` if token is not valid. |

#### refreshAuthCookies in middleware

Can be used inside Next.js Edge runtime to refresh user's authentication cookies. Useful when we want to refresh credentials after updating [custom claims](https://firebase.google.com/docs/auth/admin/custom-claims) with `setCustomUserClaims` function

Usage in [static pages example](https://github.com/awinogrodzki/next-firebase-auth-edge/blob/main/examples/next13-typescript-static-pages/middleware.ts)

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
    maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
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
  matcher: ["/", "/((?!_next/static|favicon.ico|logo.svg).*)"],
};
```

#### refreshAuthCookies in API handler

Can be used inside API middleware to refresh user's authentication cookies. Useful when we want to refresh credentials after updating [custom claims](https://firebase.google.com/docs/auth/admin/custom-claims) or user profile data

Usage in [static pages example](https://github.com/awinogrodzki/next-firebase-auth-edge/blob/main/examples/next13-typescript-static-pages/pages/api/refresh-tokens.ts)

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
      maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
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

Library provides Firebase Authentication Emulator support. An example can be found in [examples/next13-typescript-firebase-emulator](examples/next13-typescript-firebase-emulator)

Please remember to copy `.env.dist` file into `.env` and fill all needed credentials, especially:

```shell
NEXT_PUBLIC_EMULATOR_HOST=http://localhost:9099
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

`FIREBASE_AUTH_EMULATOR_HOST` is used internally by the library
`NEXT_PUBLIC_EMULATOR_HOST` is used only by provided example

Also, don't forget to put correct Firebase Project ID in `.firebaserc` file.
