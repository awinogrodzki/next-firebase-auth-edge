import {NextRequest, NextResponse} from 'next/server';
import {
  authMiddleware,
  redirectToHome,
  redirectToLogin
} from 'next-firebase-auth-edge';
import {authConfig} from './config/server-config';

const PUBLIC_PATHS = ['/register', '/login', '/reset-password'];

export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    loginPath: '/api/login',
    logoutPath: '/api/logout',
    refreshTokenPath: '/api/refresh-token',
    enableMultipleCookies: authConfig.enableMultipleCookies,
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSerializeOptions: authConfig.cookieSerializeOptions,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    serviceAccount: authConfig.serviceAccount,
    handleValidToken: async ({token, decodedToken, customToken}, headers) => {
      // Authenticated user should not be able to access /login, /register and /reset-password routes
      if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return redirectToHome(request);
      }

      const requestHeaders = new Headers(request.headers)
			requestHeaders.set('x-nonce', '123456')
			requestHeaders.set(
				'Content-Security-Policy',
				'ABCDF',
			)

      const response = NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })

      response.headers.set(
				'Content-Security-Policy',
				'ABCDF',
			)

      return response;
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
