import type { NextRequest } from 'next/server';
import { createAuthMiddlewareResponse } from 'next-firebase-auth-edge/lib/next/middleware';
import { getTokens } from 'next-firebase-auth-edge/lib/next/tokens';
import { serverConfig } from './config/server-config';
import { NextResponse } from 'next/server';

const LOGIN_PATH = '/api/login';
const LOGOUT_PATH = '/api/logout';

const commonOptions = {
  apiKey: serverConfig.firebaseApiKey,
  cookieName: 'AuthToken',
  cookieSignatureKeys: ['secret1', 'secret2'],
  cookieSerializeOptions: {
    path: '/',
    httpOnly: true,
    secure: false, // Set this to true on HTTPS environments
    sameSite: 'strict' as const,
    maxAge:  12 * 60 * 60 * 24 * 1000, // twelve days
  },
  serviceAccount: serverConfig.serviceAccount,
};

export async function middleware(request: NextRequest) {
  if ([LOGIN_PATH, LOGOUT_PATH].includes(request.nextUrl.pathname)) {
    return createAuthMiddlewareResponse(request, {
      loginPath: LOGIN_PATH,
      logoutPath: LOGOUT_PATH,
      ...commonOptions,
    });
  }

  // Optionally do something with tokens (eg. redirect to login page using NextRequest.redirect when there are no credentials)
  const tokens = await getTokens(request.cookies, commonOptions);

  if (!tokens?.decodedToken.email_verified && request.nextUrl.pathname !== '/login') {
    const url = request.nextUrl.clone();
    const prevUrl = url.pathname;
    url.pathname = '/login';
    url.search = `redirect=${prevUrl}${url.search}`;
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/', '/((?!_next/static|favicon.ico|logo.svg).*)'],
};

