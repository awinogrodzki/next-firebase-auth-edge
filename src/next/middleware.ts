import {CookieSerializeOptions} from 'cookie';
import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {Tokens, getFirebaseAuth, handleExpiredToken} from '../auth';
import {ServiceAccount} from '../auth/credential';
import {InvalidTokenError, InvalidTokenReason} from '../auth/error';
import {debug, enableDebugMode} from '../debug';
import {
  createVerifier,
  markCookiesAsVerified,
  removeAuthCookies,
  removeInternalVerifiedCookieIfExists,
  setAuthCookies,
  wasResponseDecoratedWithModifiedRequestHeaders
} from './cookies';
import {refreshToken} from './refresh-token';
import {
  GetTokensOptions,
  getRequestCookiesTokens,
  validateOptions
} from './tokens';
import {getReferer} from './utils';

export interface CreateAuthMiddlewareOptions {
  loginPath: string;
  logoutPath: string;
  cookieName: string;
  cookieSignatureKeys: string[];
  cookieSerializeOptions: CookieSerializeOptions;
  serviceAccount?: ServiceAccount;
  apiKey: string;
  tenantId?: string;
  refreshTokenPath?: string;
  enableMultipleCookies?: boolean;
}

interface RedirectToHomeOptions {
  path: string;
}

export function redirectToHome(
  request: NextRequest,
  options: RedirectToHomeOptions = {
    path: '/'
  }
) {
  const url = request.nextUrl.clone();
  url.pathname = options.path;
  url.search = '';
  return NextResponse.redirect(url);
}

interface RedirectToLoginOptions {
  path: string;
  publicPaths: string[];
  redirectParamKeyName?: string;
}

export function redirectToLogin(
  request: NextRequest,
  options: RedirectToLoginOptions = {
    path: '/login',
    publicPaths: ['/login']
  }
) {
  const redirectKey = options.redirectParamKeyName || 'redirect';

  if (options.publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = options.path;
  url.search = `${redirectKey}=${request.nextUrl.pathname}${url.search}`;
  return NextResponse.redirect(url);
}

export async function createAuthMiddlewareResponse(
  request: NextRequest,
  options: CreateAuthMiddlewareOptions
): Promise<NextResponse> {
  if (request.nextUrl.pathname === options.loginPath) {
    return setAuthCookies(request.headers, {
      cookieName: options.cookieName,
      cookieSerializeOptions: options.cookieSerializeOptions,
      cookieSignatureKeys: options.cookieSignatureKeys,
      serviceAccount: options.serviceAccount,
      apiKey: options.apiKey,
      tenantId: options.tenantId,
      enableMultipleCookies: options.enableMultipleCookies
    });
  }

  if (request.nextUrl.pathname === options.logoutPath) {
    return removeAuthCookies(request.headers, {
      cookieName: options.cookieName,
      cookieSerializeOptions: options.cookieSerializeOptions,
      enableMultipleCookies: options.enableMultipleCookies
    });
  }

  if (
    options.refreshTokenPath &&
    request.nextUrl.pathname === options.refreshTokenPath
  ) {
    return refreshToken(request, options);
  }

  return NextResponse.next();
}

export type HandleInvalidToken = (
  reason: InvalidTokenReason
) => Promise<NextResponse>;
export type HandleValidToken = (
  tokens: Tokens,
  headers: Headers
) => Promise<NextResponse>;
export type HandleError = (e: unknown) => Promise<NextResponse>;

export interface AuthMiddlewareOptions
  extends CreateAuthMiddlewareOptions,
    GetTokensOptions {
  checkRevoked?: boolean;
  handleInvalidToken?: HandleInvalidToken;
  handleValidToken?: HandleValidToken;
  handleError?: HandleError;
  debug?: boolean;
}

const defaultInvalidTokenHandler = async () => NextResponse.next();

const defaultValidTokenHandler: HandleValidToken = async (
  _tokens: Tokens,
  headers: Headers
) =>
  NextResponse.next({
    request: {
      headers
    }
  });

function validateResponse(response: NextResponse) {
  if (!wasResponseDecoratedWithModifiedRequestHeaders(response)) {
    console.warn(
      `– \x1b[33mwarn\x1b[0m next-firebase-auth-edge: NextResponse returned by handleValidToken was not decorated by modified request headers. This can cause token verification to happen multiple times in a single request. See: https://next-firebase-auth-edge-docs.vercel.app/docs/usage/middleware#middleware-token-verification-caching`
    );
  }
}

export async function authMiddleware(
  request: NextRequest,
  options: AuthMiddlewareOptions
): Promise<NextResponse> {
  if (options.debug) {
    enableDebugMode();
  }

  validateOptions(options);

  const referer = getReferer(request.headers) ?? '';
  const handleValidToken = options.handleValidToken ?? defaultValidTokenHandler;
  const handleError = options.handleError ?? defaultInvalidTokenHandler;
  const handleInvalidToken =
    options.handleInvalidToken ?? defaultInvalidTokenHandler;

  removeInternalVerifiedCookieIfExists(request.cookies);

  debug('Handle request', {path: request.nextUrl.pathname});

  if (
    [options.loginPath, options.logoutPath, options.refreshTokenPath]
      .filter(Boolean)
      .includes(request.nextUrl.pathname)
  ) {
    debug('Handle authentication API route');
    return createAuthMiddlewareResponse(request, options);
  }

  const {verifyIdToken, handleTokenRefresh} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  try {
    const customTokens = await getRequestCookiesTokens(
      request.cookies,
      options
    );

    return await handleExpiredToken(
      async () => {
        debug('Verifying user credentials...');

        const decodedToken = await verifyIdToken(customTokens.idToken, {
          checkRevoked: options.checkRevoked,
          referer
        });

        debug('Credentials verified successfully');

        markCookiesAsVerified(request.cookies);
        const response = await handleValidToken(
          {
            token: customTokens.idToken,
            decodedToken,
            customToken: customTokens.customToken
          },
          request.headers
        );

        debug('Successfully handled authenticated response');

        if (!response.headers.has('location')) {
          validateResponse(response);
        }

        return response;
      },
      async () => {
        debug('Token has expired. Refreshing token...');

        const {idToken, decodedIdToken, refreshToken, customToken} =
          await handleTokenRefresh(customTokens.refreshToken, {
            referer
          });

        debug(
          'Token refreshed successfully. Updating response cookie headers...'
        );

        const tokensToSign = {
          idToken,
          refreshToken,
          customToken
        };

        const verifier = createVerifier(tokensToSign, options);

        await verifier.init();

        verifier.appendCookies(request.cookies);

        markCookiesAsVerified(request.cookies);
        const response = await handleValidToken(
          {token: idToken, decodedToken: decodedIdToken, customToken},
          request.headers
        );

        debug('Successfully handled authenticated response');

        validateResponse(response);

        verifier.appendHeaders(response.headers);

        return response;
      },
      async (e) => {
        debug('Authentication failed with error', {error: e});

        return handleError(e);
      }
    );
  } catch (error: unknown) {
    if (error instanceof InvalidTokenError) {
      debug(
        `Token is missing or has incorrect formatting. This is expected and usually means that user has not yet logged in`,
        {
          reason: error.reason
        }
      );
      return handleInvalidToken(error.reason);
    }

    throw error;
  }
}
