import {CookieSerializeOptions, serialize} from 'cookie';
import {IncomingHttpHeaders} from 'http';
import {NextApiRequest, NextApiResponse} from 'next';
import {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {NextRequest, NextResponse} from 'next/server';
import {getFirebaseAuth} from '../auth';
import {signTokens} from '../auth/cookies/sign';
import {ServiceAccount} from '../auth/credential';
import {CustomTokens, VerifiedTokens} from '../auth/custom-token';
import {debug} from '../debug';
import {getCookiesTokens, getRequestCookiesTokens} from './tokens';
import {getReferer} from './utils';

export interface SetAuthCookiesOptions {
  cookieName: string;
  cookieSignatureKeys: string[];
  cookieSerializeOptions: CookieSerializeOptions;
  enableMultipleCookies?: boolean;
  serviceAccount?: ServiceAccount;
  apiKey: string;
  tenantId?: string;
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

export async function appendAuthCookiesApi(
  response: NextApiResponse,
  tokens: CustomTokens,
  options: SetAuthCookiesOptions
) {
  const signedTokens = await signTokens(tokens, options.cookieSignatureKeys);

  serializeCookies(signedTokens, options, (value) => {
    response.setHeader('Set-Cookie', [value]);
  });
}

function generateEmptyCookies(
  options: RemoveAuthCookiesOptions,
  callback: (name: string) => void
) {
  callback(options.cookieName);
}

function generateCookies(
  signedTokens: string,
  options: SetAuthCookiesOptions,
  callback: (name: string, value: string) => void
) {
  callback(options.cookieName, signedTokens);
}

function serializeCookies(
  signedTokens: string,
  options: SetAuthCookiesOptions,
  callback: (setCookieHeader: string) => void
) {
  generateCookies(signedTokens, options, (name, value) => {
    callback(serialize(name, value, options.cookieSerializeOptions));
  });
}

function serializeEmptyCookies(
  options: RemoveAuthCookiesOptions,
  callback: (setCookieHeader: string) => void
) {
  const {maxAge, expires, ...cookieOptions} = options.cookieSerializeOptions;

  generateEmptyCookies(options, (name) => {
    callback(
      serialize(name, '', {
        ...cookieOptions,
        expires: new Date(0)
      })
    );
  });
}

export function appendResponseCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  signedTokens: string,
  options: SetAuthCookiesOptions
) {
  generateCookies(signedTokens, options, (name, value) => {
    cookies.set(name, value);
  });
}

export function appendResponseHeaders(
  headers: Headers,
  signedTokens: string,
  options: SetAuthCookiesOptions
) {
  serializeCookies(signedTokens, options, (value) =>
    headers.append('Set-Cookie', value)
  );
}

export async function appendAuthCookies(
  response: NextResponse,
  tokens: CustomTokens,
  options: SetAuthCookiesOptions
) {
  const signedTokens = await signTokens(tokens, options.cookieSignatureKeys);

  debug('Updating response headers with authenticated cookies');

  appendResponseHeaders(response.headers, signedTokens, options);
}

export async function setAuthCookies(
  headers: Headers,
  options: SetAuthCookiesOptions
): Promise<NextResponse> {
  const {getCustomIdAndRefreshTokens} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });
  const token = headers.get('Authorization')?.split(' ')[1] ?? '';

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

  await appendAuthCookies(response, customTokens, options);

  return response;
}

export interface RemoveAuthCookiesOptions {
  cookieName: string;
  cookieSerializeOptions: CookieSerializeOptions;
  enableMultipleCookies?: boolean;
}

function appendEmptyResponseHeaders(
  response: NextResponse,
  options: RemoveAuthCookiesOptions
) {
  serializeEmptyCookies(options, (value) =>
    response.headers.append('Set-Cookie', value)
  );
}

export function removeAuthCookies(
  _headers: Headers,
  options: RemoveAuthCookiesOptions
): NextResponse {
  const response = new NextResponse(JSON.stringify({success: true}), {
    status: 200,
    headers: {'content-type': 'application/json'}
  });

  appendEmptyResponseHeaders(response, options);

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

export async function refreshApiCookies(
  cookies: Partial<{
    [key: string]: string;
  }>,
  headers: IncomingHttpHeaders,
  options: SetAuthCookiesOptions
): Promise<VerifiedTokens> {
  const referer = headers['referer'] ?? '';
  const tokens = await getCookiesTokens(cookies, options);
  const {handleTokenRefresh} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  const tokenRefreshResult = await handleTokenRefresh(tokens.refreshToken, {
    referer
  });

  return {
    customToken: tokenRefreshResult.customToken,
    idToken: tokenRefreshResult.idToken,
    refreshToken: tokenRefreshResult.refreshToken,
    decodedIdToken: tokenRefreshResult.decodedIdToken
  };
}

export async function refreshApiResponseCookies(
  request: NextApiRequest,
  response: NextApiResponse,
  options: SetAuthCookiesOptions
): Promise<NextApiResponse> {
  const customTokens = await refreshApiCookies(
    request.cookies,
    request.headers,
    options
  );
  await appendAuthCookiesApi(response, customTokens, options);

  return response;
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

  const signedTokens = await signTokens(
    customTokens,
    options.cookieSignatureKeys
  );

  appendResponseCookies(request.cookies, signedTokens, options);

  const responseOrPromise = responseFactory({
    headers: request.headers,
    tokens: customTokens
  });

  const response =
    responseOrPromise instanceof Promise
      ? await responseOrPromise
      : responseOrPromise;

  appendResponseHeaders(response.headers, signedTokens, options);

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

  await appendAuthCookies(response, customTokens, options);

  return response;
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

  await appendAuthCookies(response, customTokens, options);

  return response;
}

export async function refreshServerCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  headers: Headers,
  options: SetAuthCookiesOptions
): Promise<void> {
  const customTokens = await refreshNextCookies(cookies, headers, options);
  const signedTokens = await signTokens(
    customTokens,
    options.cookieSignatureKeys
  );

  appendResponseCookies(cookies, signedTokens, options);
}
