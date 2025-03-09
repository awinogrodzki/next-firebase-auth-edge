import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {ServiceAccount} from '../auth/credential.js';
import {
  AuthError,
  AuthErrorCode,
  InvalidTokenError,
  InvalidTokenReason,
  isInvalidTokenError
} from '../auth/error.js';
import {getFirebaseAuth, handleExpiredToken, Tokens} from '../auth/index.js';
import {debug, enableDebugMode} from '../debug/index.js';
import {AuthCookies} from './cookies/AuthCookies.js';
import {
  removeAuthCookies,
  setAuthCookies,
  SetAuthCookiesOptions
} from './cookies/index.js';
import {RequestCookiesProvider} from './cookies/parser/RequestCookiesProvider.js';
import {
  markCookiesAsVerified,
  removeInternalVerifiedCookieIfExists,
  wasResponseDecoratedWithModifiedRequestHeaders
} from './cookies/verification.js';
import {refreshToken} from './refresh-token.js';
import {getRequestCookiesTokens, validateOptions} from './tokens.js';
import {getReferer} from './utils.js';
import {getMetadataInternal} from './metadata.js';
import {mapJwtPayloadToDecodedIdToken} from '../auth/utils.js';
import {decodeJwt} from 'jose';

export interface CreateAuthMiddlewareOptions<Metadata extends object>
  extends SetAuthCookiesOptions<Metadata> {
  loginPath: string;
  logoutPath: string;
  refreshTokenPath?: string;
  experimental_createAnonymousUserIfUserNotFound?: boolean;
}

interface RedirectToPathOptions {
  shouldClearSearchParams: boolean;
}

export function redirectToPath(
  request: NextRequest,
  path: string,
  options: RedirectToPathOptions = {shouldClearSearchParams: false}
) {
  const url = request.nextUrl.clone();
  url.pathname = path;

  if (options.shouldClearSearchParams) {
    url.search = '';
  }

  return NextResponse.redirect(url);
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
  return redirectToPath(request, options.path, {shouldClearSearchParams: true});
}

export type PublicPath = string | RegExp;

interface RedirectToLoginOptions {
  path: string;
  publicPaths: PublicPath[];
  redirectParamKeyName?: string;
}

function doesRequestPathnameMatchPublicPath(
  request: NextRequest,
  publicPath: PublicPath
) {
  if (typeof publicPath === 'string') {
    return publicPath === getUrlWithoutTrailingSlash(request.nextUrl.pathname);
  }

  return publicPath.test(getUrlWithoutTrailingSlash(request.nextUrl.pathname));
}

function doesRequestPathnameMatchOneOfPublicPaths(
  request: NextRequest,
  publicPaths: PublicPath[]
) {
  return publicPaths.some((path) =>
    doesRequestPathnameMatchPublicPath(request, path)
  );
}

function getUrlWithoutTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function redirectToLogin(
  request: NextRequest,
  options: RedirectToLoginOptions = {
    path: '/login',
    publicPaths: ['/login']
  }
) {
  const redirectKey = options.redirectParamKeyName || 'redirect';

  if (doesRequestPathnameMatchOneOfPublicPaths(request, options.publicPaths)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = options.path;
  url.search = `${redirectKey}=${request.nextUrl.pathname}${url.search}`;
  return NextResponse.redirect(url);
}

export async function createAuthMiddlewareResponse<Metadata extends object>(
  request: NextRequest,
  options: CreateAuthMiddlewareOptions<Metadata>
): Promise<NextResponse> {
  const url = getUrlWithoutTrailingSlash(request.nextUrl.pathname);
  if (url === getUrlWithoutTrailingSlash(options.loginPath)) {
    return setAuthCookies(request.headers, {
      cookieName: options.cookieName,
      cookieSerializeOptions: options.cookieSerializeOptions,
      cookieSignatureKeys: options.cookieSignatureKeys,
      serviceAccount: options.serviceAccount,
      apiKey: options.apiKey,
      tenantId: options.tenantId,
      enableMultipleCookies: options.enableMultipleCookies,
      authorizationHeaderName: options.authorizationHeaderName,
      enableCustomToken: options.enableCustomToken,
      dynamicCustomClaimsKeys: options.dynamicCustomClaimsKeys
    });
  }

  if (url === getUrlWithoutTrailingSlash(options.logoutPath)) {
    return removeAuthCookies(request.headers, {
      cookieName: options.cookieName,
      cookieSerializeOptions: options.cookieSerializeOptions
    });
  }

  if (
    options.refreshTokenPath &&
    url === getUrlWithoutTrailingSlash(options.refreshTokenPath)
  ) {
    return refreshToken(request, options);
  }

  return NextResponse.next();
}

export type HandleInvalidToken = (
  reason: InvalidTokenReason
) => Promise<NextResponse>;
export type HandleValidToken<Metadata extends object> = (
  tokens: Tokens<Metadata>,
  headers: Headers
) => Promise<NextResponse>;
export type HandleError = (e: unknown) => Promise<NextResponse>;

export interface AuthMiddlewareOptions<Metadata extends object>
  extends CreateAuthMiddlewareOptions<Metadata> {
  serviceAccount?: ServiceAccount;
  apiKey: string;
  debug?: boolean;
  headers?: Headers;
  checkRevoked?: boolean;
  handleInvalidToken?: HandleInvalidToken;
  handleValidToken?: HandleValidToken<Metadata>;
  handleError?: HandleError;
  experimental_enableTokenRefreshOnExpiredKidHeader?: boolean;
}

const defaultInvalidTokenHandler = async () => NextResponse.next();

const defaultValidTokenHandler = async <Metadata extends object>(
  _tokens: Tokens<Metadata>,
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

export async function authMiddleware<Metadata extends object>(
  request: NextRequest,
  options: AuthMiddlewareOptions<Metadata>
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

  debug('Handle request', {
    path: getUrlWithoutTrailingSlash(request.nextUrl.pathname)
  });

  const authMiddlewareResponseRoutes = [
    options.loginPath,
    options.logoutPath,
    options.refreshTokenPath
  ]
    .filter(Boolean)
    .map((url) => getUrlWithoutTrailingSlash(url as string));

  if (
    authMiddlewareResponseRoutes.includes(
      getUrlWithoutTrailingSlash(request.nextUrl.pathname)
    )
  ) {
    debug('Handle authentication API route');
    return createAuthMiddlewareResponse(request, options);
  }

  const {verifyIdToken, handleTokenRefresh, createAnonymousUser} =
    getFirebaseAuth({
      serviceAccount: options.serviceAccount,
      apiKey: options.apiKey,
      tenantId: options.tenantId
    });

  try {
    debug('Attempt to fetch request cookies tokens');

    const tokens = await getRequestCookiesTokens<Metadata>(
      request.cookies,
      options
    );

    return await handleExpiredToken(
      async () => {
        debug('Verifying user credentials...');

        const decodedToken = await verifyIdToken(tokens.idToken, {
          checkRevoked: options.checkRevoked,
          referer
        });

        debug('Credentials verified successfully');

        markCookiesAsVerified(request.cookies);
        const response = await handleValidToken(
          {
            token: tokens.idToken,
            decodedToken,
            customToken: tokens.customToken,
            metadata: tokens.metadata
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
          await handleTokenRefresh(tokens.refreshToken, {
            referer,
            enableCustomToken: options.enableCustomToken
          });

        debug(
          'Token refreshed successfully. Updating response cookie headers...'
        );

        const metadata = await getMetadataInternal<Metadata>(
          {
            idToken,
            decodedIdToken,
            refreshToken,
            customToken
          },
          options
        );

        const valueToSign = {
          idToken,
          refreshToken,
          customToken,
          metadata
        };

        const cookies = new AuthCookies(
          RequestCookiesProvider.fromHeaders(request.headers),
          options
        );

        await cookies.setAuthCookies(valueToSign, request.cookies);

        markCookiesAsVerified(request.cookies);
        const response = await handleValidToken(
          {token: idToken, decodedToken: decodedIdToken, customToken, metadata},
          request.headers
        );

        debug('Successfully handled authenticated response');

        validateResponse(response);

        await cookies.setAuthHeaders(valueToSign, response.headers);

        return response;
      },
      async (e) => {
        if (
          e instanceof AuthError &&
          e.code === AuthErrorCode.NO_MATCHING_KID
        ) {
          throw InvalidTokenError.fromError(e, InvalidTokenReason.INVALID_KID);
        }

        debug('Authentication failed with error', {error: e});

        return handleError(e);
      },
      options.experimental_enableTokenRefreshOnExpiredKidHeader ?? false
    );
  } catch (error: unknown) {
    if (isInvalidTokenError(error)) {
      debug(
        `Token is missing or has incorrect formatting. This is expected and usually means that user has not yet logged in`,
        {
          reason: error.reason
        }
      );
      if (options.experimental_createAnonymousUserIfUserNotFound) {
        const {idToken, refreshToken} = await createAnonymousUser(
          options.apiKey
        );

        const decodedIdToken = mapJwtPayloadToDecodedIdToken(
          decodeJwt(idToken)
        );

        const metadata = await getMetadataInternal<Metadata>(
          {
            idToken,
            decodedIdToken,
            refreshToken
          },
          options
        );

        const valueToSign = {
          idToken,
          refreshToken,
          metadata
        };

        const cookies = new AuthCookies(
          RequestCookiesProvider.fromHeaders(request.headers),
          options
        );

        await cookies.setAuthCookies(valueToSign, request.cookies);

        const decodedToken = await verifyIdToken(idToken, {
          checkRevoked: options.checkRevoked,
          referer
        });

        markCookiesAsVerified(request.cookies);
        const response = await handleValidToken(
          {token: idToken, decodedToken, metadata},
          request.headers
        );

        validateResponse(response);

        await cookies.setAuthHeaders(valueToSign, response.headers);

        return response;
      }
      return handleInvalidToken(error.reason);
    }

    throw error;
  }
}
