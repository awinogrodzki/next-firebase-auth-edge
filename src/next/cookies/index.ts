import {type CookieSerializeOptions} from 'cookie';
import type {IncomingHttpHeaders} from 'http';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {ServiceAccount} from '../../auth/credential.js';
import {CustomTokens, VerifiedTokens} from '../../auth/custom-token/index.js';
import {getFirebaseAuth} from '../../auth/index.js';
import {debug} from '../../debug/index.js';
import {getCookiesTokens, getRequestCookiesTokens} from '../tokens.js';
import {getReferer} from '../utils.js';
import {AuthCookies} from './AuthCookies.js';
import {CookieRemoverFactory} from './remover/CookieRemoverFactory.js';
import {RequestCookiesProvider} from './parser/RequestCookiesProvider.js';

export interface SetAuthCookiesOptions {
  cookieName: string;
  cookieSignatureKeys: string[];
  cookieSerializeOptions: CookieSerializeOptions;
  enableMultipleCookies?: boolean;
  serviceAccount?: ServiceAccount;
  apiKey: string;
  tenantId?: string;
  authorizationHeaderName?: string;
}

export type CookiesObject = Partial<{[K in string]: string}>;

const INTERNAL_VERIFIED_TOKEN_COOKIE_NAME =
  'x-next-firebase-auth-edge-verified';
const INTERNAL_VERIFIED_TOKEN_COOKIE_VALUE = 'true';

export function removeInternalVerifiedCookieIfExists(
  cookies: RequestCookies | ReadonlyRequestCookies
) {
  if (cookies.get(INTERNAL_VERIFIED_TOKEN_COOKIE_NAME)?.value) {
    cookies.delete(INTERNAL_VERIFIED_TOKEN_COOKIE_NAME);
  }
}

export function markCookiesAsVerified(
  cookies: RequestCookies | ReadonlyRequestCookies
) {
  cookies.set(
    INTERNAL_VERIFIED_TOKEN_COOKIE_NAME,
    INTERNAL_VERIFIED_TOKEN_COOKIE_VALUE
  );
}

export function wasResponseDecoratedWithModifiedRequestHeaders(
  response: NextResponse
) {
  const cookie = response.headers.get('cookie');
  const middlewareRequestCookie = response.headers.get(
    'x-middleware-request-cookie'
  );

  return (
    cookie?.includes(INTERNAL_VERIFIED_TOKEN_COOKIE_NAME) ||
    middlewareRequestCookie?.includes(INTERNAL_VERIFIED_TOKEN_COOKIE_NAME) ||
    false
  );
}

export function areCookiesVerifiedByMiddleware(
  cookies: RequestCookies | ReadonlyRequestCookies
) {
  return (
    cookies.get(INTERNAL_VERIFIED_TOKEN_COOKIE_NAME)?.value ===
    INTERNAL_VERIFIED_TOKEN_COOKIE_VALUE
  );
}

export function isCookiesObjectVerifiedByMiddleware(cookies: CookiesObject) {
  return (
    cookies[INTERNAL_VERIFIED_TOKEN_COOKIE_NAME] ===
    INTERNAL_VERIFIED_TOKEN_COOKIE_VALUE
  );
}

export async function appendAuthCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  response: NextResponse,
  tokens: CustomTokens,
  options: SetAuthCookiesOptions
) {
  debug('Updating response headers with authenticated cookies');

  const authCookies = new AuthCookies(
    new RequestCookiesProvider(cookies),
    options
  );

  await authCookies.setAuthHeaders(tokens, response.headers);
}

export async function setAuthCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  headers: Headers,
  options: SetAuthCookiesOptions
): Promise<NextResponse> {
  const {getCustomIdAndRefreshTokens} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });
  const authHeader = options.authorizationHeaderName ?? 'Authorization';
  const token = headers.get(authHeader)?.split(' ')[1] ?? '';

  if (!token) {
    const response = new NextResponse(
      JSON.stringify({success: false, message: 'Missing token'}),
      {
        status: 400,
        headers: {'content-type': 'application/json'}
      }
    );

    return response;
  }

  const appCheckToken = headers.get('X-Firebase-AppCheck') ?? undefined;
  const referer = getReferer(headers) ?? '';

  const customTokens = await getCustomIdAndRefreshTokens(token, {
    appCheckToken,
    referer
  });

  debug('Successfully generated custom tokens');

  const response = new NextResponse(JSON.stringify({success: true}), {
    status: 200,
    headers: {'content-type': 'application/json'}
  });

  await appendAuthCookies(cookies, response, customTokens, options);

  return response;
}

export interface RemoveAuthCookiesOptions {
  cookieName: string;
  cookieSerializeOptions: CookieSerializeOptions;
}

export function removeCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  response: NextResponse,
  options: RemoveAuthCookiesOptions
) {
  const remover = CookieRemoverFactory.fromHeaders(
    response.headers,
    new RequestCookiesProvider(cookies),
    options.cookieName
  );

  return remover.removeCookies(options.cookieSerializeOptions);
}

export function removeAuthCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  options: RemoveAuthCookiesOptions
): NextResponse {
  const response = new NextResponse(JSON.stringify({success: true}), {
    status: 200,
    headers: {'content-type': 'application/json'}
  });

  removeCookies(cookies, response, options);

  debug('Updating response with empty authentication cookie headers', {
    cookieName: options.cookieName
  });

  return response;
}

export async function verifyApiCookies(
  cookies: Partial<{
    [key: string]: string;
  }>,
  headers: IncomingHttpHeaders,
  options: SetAuthCookiesOptions
): Promise<VerifiedTokens> {
  const tokens = await getCookiesTokens(cookies, options);
  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  const verifyTokenResult = await verifyAndRefreshExpiredIdToken(tokens, {
    referer: headers.referer ?? ''
  });

  return verifyTokenResult;
}

export async function verifyNextCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  headers: Headers,
  options: SetAuthCookiesOptions
): Promise<VerifiedTokens> {
  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });
  const referer = getReferer(headers) ?? '';
  const tokens = await getRequestCookiesTokens(cookies, options);
  const verifyTokenResult = await verifyAndRefreshExpiredIdToken(tokens, {
    referer
  });

  return verifyTokenResult;
}

export async function refreshNextCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  headers: Headers,
  options: SetAuthCookiesOptions
): Promise<VerifiedTokens> {
  const {handleTokenRefresh} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });
  const referer = getReferer(headers) ?? '';
  const tokens = await getRequestCookiesTokens(cookies, options);
  const tokenRefreshResult = await handleTokenRefresh(tokens.refreshToken, {
    referer
  });

  return {
    idToken: tokenRefreshResult.idToken,
    refreshToken: tokenRefreshResult.refreshToken,
    customToken: tokenRefreshResult.customToken,
    decodedIdToken: tokenRefreshResult.decodedIdToken
  };
}

export async function refreshCredentials(
  request: NextRequest,
  options: SetAuthCookiesOptions,
  responseFactory: (options: {
    headers: Headers;
    tokens: VerifiedTokens;
  }) => NextResponse | Promise<NextResponse>
): Promise<NextResponse> {
  const customTokens = await refreshNextCookies(
    request.cookies,
    request.headers,
    options
  );

  const cookies = new AuthCookies(
    new RequestCookiesProvider(request.cookies),
    options
  );
  await cookies.setAuthCookies(customTokens, request.cookies);

  const responseOrPromise = responseFactory({
    headers: request.headers,
    tokens: customTokens
  });

  const response =
    responseOrPromise instanceof Promise
      ? await responseOrPromise
      : responseOrPromise;

  await cookies.setAuthHeaders(customTokens, response.headers);

  return response;
}

export async function refreshNextResponseCookiesWithToken(
  idToken: string,
  request: NextRequest,
  response: NextResponse,
  options: SetAuthCookiesOptions
): Promise<NextResponse> {
  const appCheckToken = request.headers.get('X-Firebase-AppCheck') ?? undefined;
  const referer = getReferer(request.headers) ?? '';

  const {getCustomIdAndRefreshTokens} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  const customTokens = await getCustomIdAndRefreshTokens(idToken, {
    appCheckToken,
    referer
  });

  await appendAuthCookies(request.cookies, response, customTokens, options);

  return response;
}

export async function refreshCookiesWithIdToken(
  idToken: string,
  headers: Headers,
  cookies: RequestCookies | ReadonlyRequestCookies,
  options: SetAuthCookiesOptions
): Promise<void> {
  const appCheckToken = headers.get('X-Firebase-AppCheck') ?? undefined;
  const referer = getReferer(headers) ?? '';

  const {getCustomIdAndRefreshTokens} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  const customTokens = await getCustomIdAndRefreshTokens(idToken, {
    appCheckToken,
    referer
  });

  const authCookies = new AuthCookies(
    new RequestCookiesProvider(cookies),
    options
  );

  await authCookies.setAuthCookies(customTokens, cookies);
}

export async function refreshNextResponseCookies(
  request: NextRequest,
  response: NextResponse,
  options: SetAuthCookiesOptions
): Promise<NextResponse> {
  const customTokens = await refreshNextCookies(
    request.cookies,
    request.headers,
    options
  );

  await appendAuthCookies(request.cookies, response, customTokens, options);

  return response;
}

export async function refreshServerCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  headers: Headers,
  options: SetAuthCookiesOptions
): Promise<void> {
  const customTokens = await refreshNextCookies(cookies, headers, options);
  const authCookies = new AuthCookies(
    new RequestCookiesProvider(cookies),
    options
  );

  await authCookies.setAuthCookies(customTokens, cookies);
  await authCookies.setAuthHeaders(customTokens, headers);
}
