import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { CookieSerializeOptions } from 'cookie';
import { ServiceAccount } from '../auth/credential';
import { removeAuthCookies, setAuthCookies } from './cookies';

export interface CreateAuthMiddlewareOptions{
  loginPath: string;
  logoutPath: string;
  cookieName: string;
  cookieSignatureKeys: string[];
  cookieSerializeOptions: CookieSerializeOptions;
  serviceAccount: ServiceAccount;
  apiKey: string;
}

export async function createAuthMiddlewareResponse(request: NextRequest, options: CreateAuthMiddlewareOptions): Promise<NextResponse | void> {
  if (request.nextUrl.pathname === options.loginPath) {
    return setAuthCookies(request.headers, {
      cookieName: options.cookieName,
      cookieSerializeOptions: options.cookieSerializeOptions,
      cookieSignatureKeys: options.cookieSignatureKeys,
      serviceAccount: options.serviceAccount,
      apiKey: options.apiKey,
    });
  }

  if (request.nextUrl.pathname === options.logoutPath) {
    return removeAuthCookies(request.headers, {
      cookieName: options.cookieName,
      cookieSerializeOptions: options.cookieSerializeOptions,
    });
  }
}
