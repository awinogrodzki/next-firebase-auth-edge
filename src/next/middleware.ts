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

export type Path = string | RegExp;

// @deprecated - Use `Path` instead
export type PublicPath = Path;

export interface RedirectToLoginOptions {
  path: string;
  redirectParamKeyName?: string;
  publicPaths?: Path[];
  privatePaths?: Path[];
}

function doesRequestPathnameMatchPath(request: NextRequest, path: Path) {
  if (typeof path === 'string') {
    return path === getUrlWithoutTrailingSlash(request.nextUrl.pathname);
  }

  return path.test(getUrlWithoutTrailingSlash(request.nextUrl.pathname));
}

function doesRequestPathnameMatchOneOfPaths(
  request: NextRequest,
  paths: Path[]
) {
  return paths.some((path) => doesRequestPathnameMatchPath(request, path));
}

function getUrlWithoutTrailingSlash(url: string) {
  if (url === '/') {
    return '/';
  }

  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function createLoginRedirectResponse(
  request: NextRequest,
  options: RedirectToLoginOptions
) {
  const redirectKey = options.redirectParamKeyName || 'redirect';
  const url = request.nextUrl.clone();
  url.pathname = options.path;
  const encodedRedirect = encodeURIComponent(
    `${request.nextUrl.pathname}${url.search}`
  );
  url.search = `${redirectKey}=${encodedRedirect}`;

  return NextResponse.redirect(url);
}

export function redirectToLogin(
  request: NextRequest,
  options: RedirectToLoginOptions = {
    path: '/login',
    publicPaths: ['/login']
  }
) {
  if (
    options.publicPaths &&
    doesRequestPathnameMatchOneOfPaths(request, options.publicPaths)
  ) {
    return NextResponse.next();
  }

  if (
    options.privatePaths &&
    !doesRequestPathnameMatchOneOfPaths(request, options.privatePaths)
  ) {
    return NextResponse.next();
  }

  return createLoginRedirectResponse(request, options);
}

export async function createAuthMiddlewareResponse<Metadata extends object>(
  request: NextRequest,
  options: CreateAuthMiddlewareOptions<Metadata>
): Promise<NextResponse> {
  const url = getUrlWithoutTrailingSlash(request.nextUrl.pathname);
  if (url === getUrlWithoutTrailingSlash(options.loginPath)) {
    return setAuthCookies(request.headers, options);
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
  enableTokenRefreshOnExpiredKidHeader?: boolean;
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

export async function authMiddleware<Metadata extends object>(
  request: NextRequest,
  middlewareOptions: AuthMiddlewareOptions<Metadata>
): Promise<NextResponse> {
  const options: AuthMiddlewareOptions<Metadata> = {
    enableTokenRefreshOnExpiredKidHeader: true,
    ...middlewareOptions
  };

  if (options.debug) {
    enableDebugMode();
  }

  validateOptions(options);

  const referer = getReferer(request.headers) ?? '';
  const handleValidToken = options.handleValidToken ?? defaultValidTokenHandler;
  const handleError = options.handleError ?? defaultInvalidTokenHandler;
  const handleInvalidToken =
    options.handleInvalidToken ?? defaultInvalidTokenHandler;

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
        const response = await handleValidToken(
          {token: idToken, decodedToken: decodedIdToken, customToken, metadata},
          request.headers
        );

        debug('Successfully handled authenticated response');

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
      options.enableTokenRefreshOnExpiredKidHeader ?? false
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

        const response = await handleValidToken(
          {token: idToken, decodedToken, metadata},
          request.headers
        );
        await cookies.setAuthHeaders(valueToSign, response.headers);

        return response;
      }
      return handleInvalidToken(error.reason);
    }

    throw error;
  }
}
