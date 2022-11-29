# next-firebase-auth-edge

Next.js 13 Firebase Authentication for Edge and server runtimes. Dedicated for Next 13 server components. Compatible with Next.js middleware.

## Why
Official `firebase-admin` library relies heavily on Node.js internal `crypto` library and primitives that are unavailable inside [Next.js Edge Runtime](https://nextjs.org/docs/api-reference/edge-runtime).

This library aims to solve the problem of creating and verifying custom JWT tokens provided by **Firebase Authentication** using Web Crypto API available inside Edge runtimes

## Built on top of Web Crypto API

`next-firebase-auth-edge` is built entirely upon [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) and has exactly `0` external dependencies. Although it seems fine at first, please remember that it is still in experimental and untested stage. Contributions are welcome.

Node.js polyfill for Web Crypto is provided by [@peculiar/webcrypto](https://github.com/PeculiarVentures/webcrypto), which fully supports `RSASSA-PKCS1-v1_5` algorithm used by Firebase

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

Before using this module make sure you have enabled `appDir` and `allowMiddlewareResponseBody` experimental options in `next.config.js`:

```javascript
module.exports = {
  experimental: {
    appDir: true,
    allowMiddlewareResponseBody: true
  }
}
```

### Authentication endpoints

In order to set encrypted authentication cookies we need server endpoints to handle log in and log out of the users.

This can be achieved pretty easily using `createAuthMiddlewareResponse`:

All below examples are based on working Next.js 13 app example found in [/examples](https://github.com/ensite-in/next-firebase-auth-edge/blob/d9817f62113e0520c0082a28607ec1e0a585af13/examples/next13-typescript-simple) directory


```typescript
// middleware.ts
import type { NextRequest } from 'next/server';
import { createAuthMiddlewareResponse } from 'next-firebase-auth-edge/lib/next/middleware';
import { getTokens } from 'next-firebase-auth-edge/lib/next/tokens';

const LOGIN_PATH = '/api/login';
const LOGOUT_PATH = '/api/logout';

export async function middleware(request: NextRequest) {
  const commonOptions = {
    apiKey: 'firebase-api-key',
    cookieName: 'AuthToken',
    cookieSignatureKeys: ['secret1', 'secret2'],
    cookieSerializeOptions: {
      path: '/',
      httpOnly: true,
      secure: false, // Set this to true on HTTPS environments
      sameSite: 'strict' as const,
      maxAge:  12 * 60 * 60 * 24 * 1000, // twelve days
    },
    serviceAccount: {
      projectId: 'firebase-project-id',
      privateKey: 'firebase service account private key',
      clientEmail: 'firebase service account client email',
    },
  };

  if ([LOGIN_PATH, LOGOUT_PATH].includes(request.nextUrl.pathname)) {
    return createAuthMiddlewareResponse(request, {
      loginPath: LOGIN_PATH,
      logoutPath: LOGOUT_PATH,
      ...commonOptions,
    });
  }

  // Optionally do something with tokens
  const tokens = await getTokens(request.cookies, commonOptions);

  console.log(tokens); // { decodedIdToken: DecodedIdToken, token: string } or null if unauthenticated
}
```

In this code example we define Next.js middleware that checks for `/api/login` and `/api/logout` requests and returns `AuthMiddlewareResponse`. The latter is an instance of `NextResponse` object, updated with authentication headers.


### Example AuthProvider
Below is example implementation of custom AuthProvider component that handles the calling of authentication endpoints.

`GET /api/login` endpoint can be called on `onIdTokenChanged` Firebase Authentication browser client event

`GET /api/logout` endpoint can be called any time. Make sure to sign out the user from firebase before clearing the cookies.

```tsx
export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  defaultTenant,
  children,
}) => {
  const { getFirebaseAuth } = useFirebaseAuth(clientConfig)
  const firstLoadRef = React.useRef(true);
  const [tenant, setTenant] = React.useState(defaultTenant);

  // Call logout any time
  const handleLogout = async () => {
    const auth = await getFirebaseAuth();
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    await fetch('/api/logout', {
      method: 'GET',
    });
  };

  const handleIdTokenChanged = async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser && tenant && firebaseUser.uid === tenant.id) {
      firstLoadRef.current = false;
      return;
    }

    const auth = await getFirebaseAuth();

    if (!firebaseUser && firstLoadRef.current) {
      const { signInAnonymously } = await import('firebase/auth');
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
    await fetch('/api/login', {
      method: 'GET',
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
    const { onIdTokenChanged } = await import('firebase/auth');
    return onIdTokenChanged(auth, handleIdTokenChanged);
  };

  React.useEffect(() => {
    const unsubscribePromise = registerChangeListener();

    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe());
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

`next-firebase-auth-edge` is designed to work with [React Server Components](https://nextjs.org/docs/advanced-features/react-18/server-components) along with Next.js 13.

Below is an example of root `app/layout.tsx` server component using `getTokens` function to fetch user tokens based on request cookies

```tsx
import './globals.css';
import { getTokens } from 'next-firebase-auth-edge/lib/next/tokens';
import { cookies } from 'next/headers';
import { AuthProvider } from './auth-provider';
import { serverConfig } from './server-config';
import { Tokens } from 'next-firebase-auth-edge/lib/auth';
import { Tenant } from '../auth/types';

//...

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tokens = await getTokens(cookies(), {
    apiKey: 'firebase-api-key',
    serviceAccount: {
      projectId: 'firebase-project-id',
      privateKey: 'firebase service account private key',
      clientEmail: 'firebase service account client email',
    },
    cookieName: 'AuthToken',
    cookieSignatureKeys: ['secret1', 'secret2'],
  });

  // Make sure to remove vulnerable data from Tokens using custom mapping function
  const tenant = tokens ? mapTokensToTenant(tokens) : null;
  
  return (
    <html lang="en">
        <head />
        <body>
            <AuthProvider defaultTenant={tenant}>
              {children}
            </AuthProvider>
        </body>
    </html>
  )
}
```
