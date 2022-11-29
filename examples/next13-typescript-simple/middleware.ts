import type { NextRequest } from 'next/server';
import { createAuthMiddlewareResponse } from 'next-firebase-auth-edge/lib/next/middleware';
import { getTokens } from 'next-firebase-auth-edge/lib/next/tokens';
import { serverConfig } from './app/server-config';

const LOGIN_PATH = '/api/login';
const LOGOUT_PATH = '/api/logout';

export async function middleware(request: NextRequest) {
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

  if ([LOGIN_PATH, LOGOUT_PATH].includes(request.nextUrl.pathname)) {
    return createAuthMiddlewareResponse(request, {
      loginPath: LOGIN_PATH,
      logoutPath: LOGOUT_PATH,
      ...commonOptions,
    });
  }

  // Optionally do something with tokens
  const tokens = await getTokens(request.cookies, commonOptions);

  console.log("TOKENS IN MIDDLEWARE", { tokens });
}
