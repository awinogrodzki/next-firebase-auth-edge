import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {
  authMiddleware,
  redirectToHome,
  redirectToLogin
} from 'next-firebase-auth-edge';
import {authConfig} from './config/server-config';
import {InvalidTokenError} from 'next-firebase-auth-edge/auth';

const PUBLIC_PATHS = ['/register', '/login', '/reset-password'];

export async function middleware(request: NextRequest) {
  try {
    console.log('BEFORE RUN MIDDLEWARE', request.nextUrl.pathname);
    const response = await authMiddleware(request, {
      loginPath: '/api/login',
      logoutPath: '/api/logout',
      refreshTokenPath: '/api/refresh-token',
      debug: authConfig.debug,
      enableMultipleCookies: authConfig.enableMultipleCookies,
      enableCustomToken: authConfig.enableCustomToken,
      apiKey: authConfig.apiKey,
      cookieName: authConfig.cookieName,
      cookieSerializeOptions: authConfig.cookieSerializeOptions,
      cookieSignatureKeys: authConfig.cookieSignatureKeys,
      serviceAccount: authConfig.serviceAccount,
      experimental_enableTokenRefreshOnExpiredKidHeader:
        authConfig.experimental_enableTokenRefreshOnExpiredKidHeader,
      tenantId: authConfig.tenantId,
      handleValidToken: async ({token, decodedToken, customToken}, headers) => {
        // Authenticated user should not be able to access /login, /register and /reset-password routes
        if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
          return redirectToHome(request);
        }

        return NextResponse.next({
          request: {
            headers
          }
        });
      },
      handleInvalidToken: async (_reason) => {
        return redirectToLogin(request, {
          path: '/login',
          publicPaths: PUBLIC_PATHS
        });
      },
      handleError: async (error) => {
        console.error('Unhandled authentication error', {error});

        return redirectToLogin(request, {
          path: '/login',
          publicPaths: PUBLIC_PATHS
        });
      }
    });
    console.log("RESPONSE GENERATED");
    return response;
  } catch (error) {
    console.log('ERROR RESULTED FROM AUTH MIDDLEWARE', {
      error: error?.toString(),
      errorConstructorName: error?.constructor.name,
      invalidTokenErrorConstructorName: InvalidTokenError.constructor.name,
      InvalidTokenError
    });
    throw error;
  }
}

export const config = {
  matcher: [
    '/',
    '/((?!_next|favicon.ico|__/auth|__/firebase|api|.*\\.).*)',
    '/api/login',
    '/api/logout',
    '/api/refresh-token'
  ]
};
