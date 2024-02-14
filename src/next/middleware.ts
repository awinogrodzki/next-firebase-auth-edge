import {CookieSerializeOptions} from 'cookie';
import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {
  IdAndRefreshTokens,
  Tokens,
  getFirebaseAuth,
  handleExpiredToken
} from '../auth';
import {ServiceAccount} from '../auth/credential';
import {debug, enableDebugMode} from '../debug';
import {
  SetAuthCookiesOptions,
  appendAuthCookies,
  markCookiesAsVerified,
  removeAuthCookies,
  removeInternalVerifiedCookieIfExists,
  setAuthCookies,
  toSignedCookies,
  updateRequestAuthCookies,
  updateResponseAuthCookies,
  wasResponseDecoratedWithModifiedRequestHeaders
} from './cookies';
import {GetTokensOptions, getRequestCookiesTokens} from './tokens';

export interface CreateAuthMiddlewareOptions {
  loginPath: string;
  logoutPath: string;
  cookieName: string;
  cookieSignatureKeys: string[];
  cookieSerializeOptions: CookieSerializeOptions;
  serviceAccount: ServiceAccount;
  apiKey: string;
  tenantId?: string;
}

export function redirectToHome(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/';
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
      tenantId: options.tenantId
    });
  }

  if (request.nextUrl.pathname === options.logoutPath) {
    return removeAuthCookies(request.headers, {
      cookieName: options.cookieName,
      cookieSerializeOptions: options.cookieSerializeOptions
    });
  }

  return NextResponse.next();
}

export type HandleInvalidToken = () => Promise<NextResponse>;
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

/**
 * @deprecated
 * Use `AuthMiddlewareOptions` interface instead
 */
export type AuthenticationOptions = AuthMiddlewareOptions;

/**
 * @deprecated
 * Use `refreshNextResponseCookies` from `next-firebase-auth-edge/lib/next/cookies` instead
 */
export async function refreshAuthCookies(
  idToken: string,
  response: NextResponse,
  options: SetAuthCookiesOptions
): Promise<IdAndRefreshTokens> {
  const {getCustomIdAndRefreshTokens} = getFirebaseAuth(
    options.serviceAccount,
    options.apiKey,
    options.tenantId
  );
  const idAndRefreshTokens = await getCustomIdAndRefreshTokens(
    idToken,
    options.appCheckToken
  );

  await appendAuthCookies(response, idAndRefreshTokens, options);

  return idAndRefreshTokens;
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

  const handleValidToken = options.handleValidToken ?? defaultValidTokenHandler;
  const handleError = options.handleError ?? defaultInvalidTokenHandler;
  const handleInvalidToken =
    options.handleInvalidToken ?? defaultInvalidTokenHandler;

  removeInternalVerifiedCookieIfExists(request.cookies);

  debug('Handle request', {path: request.nextUrl.pathname});

  if (
    [options.loginPath, options.logoutPath].includes(request.nextUrl.pathname)
  ) {
    debug('Handle authentication API route');
    return createAuthMiddlewareResponse(request, options);
  }

  const {verifyIdToken, handleTokenRefresh} = getFirebaseAuth(
    options.serviceAccount,
    options.apiKey,
    options.tenantId
  );

  const idAndRefreshTokens = await getRequestCookiesTokens(
    request.cookies,
    options
  );

  if (!idAndRefreshTokens) {
    debug(
      'Authentication cookies could not be verified. Proceed to handleInvalidToken.'
    );
    return handleInvalidToken();
  }

  return handleExpiredToken(
    async () => {
      debug('Verifying user credentials...');

      const decodedToken = await verifyIdToken(
        idAndRefreshTokens.idToken,
        options.checkRevoked
      );

      debug('Credentials verified successfully');

      markCookiesAsVerified(request.cookies);
      const response = await handleValidToken(
        {
          token: idAndRefreshTokens.idToken,
          decodedToken
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

      const {idToken, decodedIdToken, refreshToken} = await handleTokenRefresh(
        idAndRefreshTokens.refreshToken
      );

      debug(
        'Token refreshed successfully. Updating response cookie headers...'
      );

      const signedCookies = await toSignedCookies(
        {
          idToken,
          refreshToken
        },
        options
      );

      updateRequestAuthCookies(request, signedCookies);
      markCookiesAsVerified(request.cookies);
      const response = await handleValidToken(
        {token: idToken, decodedToken: decodedIdToken},
        request.headers
      );

      debug('Successfully handled authenticated response');

      validateResponse(response);

      return updateResponseAuthCookies(
        response,
        signedCookies,
        options.cookieSerializeOptions
      );
    },
    async (e) => {
      debug('Authentication failed with error', {error: e});

      return handleError(e);
    }
  );
}

/**
 * @deprecated
 * Backwards compatiblity with 0.x
 */
export {authMiddleware as authentication};
