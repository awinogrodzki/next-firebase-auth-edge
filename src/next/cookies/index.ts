import {type CookieSerializeOptions} from 'cookie';
import type {IncomingHttpHeaders} from 'http';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {ParsedTokens, VerifiedTokens} from '../../auth/custom-token/index.js';
import {getFirebaseAuth} from '../../auth/index.js';
import {debug} from '../../debug/index.js';
import {getCookiesTokens, getRequestCookiesTokens} from '../tokens.js';
import {getReferer} from '../utils.js';
import {AuthCookies} from './AuthCookies.js';
import {RequestCookiesProvider} from './parser/RequestCookiesProvider.js';
import {CookieExpirationFactory} from './expiration/CookieExpirationFactory.js';
import {CookiesObject, SetAuthCookiesOptions} from './types.js';
import {CookieRemoverFactory} from './remover/CookieRemoverFactory.js';

export async function appendAuthCookies(
  headers: Headers,
  response: NextResponse,
  tokens: ParsedTokens,
  options: SetAuthCookiesOptions
) {
  debug('Updating response headers with authenticated cookies');

  const authCookies = new AuthCookies(
    RequestCookiesProvider.fromHeaders(headers),
    options
  );

  await authCookies.setAuthHeaders(tokens, response.headers);
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

  await appendAuthCookies(headers, response, customTokens, options);

  return response;
}

export interface RemoveServerCookiesOptions {
  cookieName: string;
}
export function removeServerCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  options: RemoveServerCookiesOptions
) {
  const remover = CookieRemoverFactory.fromRequestCookies(
    cookies,
    RequestCookiesProvider.fromRequestCookies(cookies),
    options.cookieName
  );

  return remover.removeCookies();
}

export interface RemoveAuthCookiesOptions {
  cookieName: string;
  cookieSerializeOptions: CookieSerializeOptions;
}

export function removeCookies(
  headers: Headers,
  response: NextResponse,
  options: RemoveAuthCookiesOptions
) {
  const expiration = CookieExpirationFactory.fromHeaders(
    response.headers,
    RequestCookiesProvider.fromHeaders(headers),
    options.cookieName
  );

  return expiration.expireCookies(options.cookieSerializeOptions);
}

export function removeAuthCookies(
  headers: Headers,
  options: RemoveAuthCookiesOptions
): NextResponse {
  const response = new NextResponse(JSON.stringify({success: true}), {
    status: 200,
    headers: {'content-type': 'application/json'}
  });

  removeCookies(headers, response, options);

  debug('Updating response with empty authentication cookie headers', {
    cookieName: options.cookieName
  });

  return response;
}

export async function verifyApiCookies(
  cookies: CookiesObject,
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
    tenantId: options.tenantId,
    enableCustomToken: options.enableCustomToken
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
    referer,
    enableCustomToken: options.enableCustomToken
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
  const tokens = await refreshNextCookies(
    request.cookies,
    request.headers,
    options
  );

  const cookies = new AuthCookies(
    RequestCookiesProvider.fromHeaders(request.headers),
    options
  );
  await cookies.setAuthCookies(tokens, request.cookies);

  const responseOrPromise = responseFactory({
    headers: request.headers,
    tokens
  });

  const response =
    responseOrPromise instanceof Promise
      ? await responseOrPromise
      : responseOrPromise;

  await cookies.setAuthHeaders(tokens, response.headers);

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

  await appendAuthCookies(request.headers, response, customTokens, options);

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
    RequestCookiesProvider.fromHeaders(headers),
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

  await appendAuthCookies(request.headers, response, customTokens, options);

  return response;
}

export async function refreshServerCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  headers: Headers,
  options: SetAuthCookiesOptions
): Promise<void> {
  const customTokens = await refreshNextCookies(cookies, headers, options);
  const authCookies = new AuthCookies(
    RequestCookiesProvider.fromHeaders(headers),
    options
  );

  await authCookies.setAuthCookies(customTokens, cookies);
  await authCookies.setAuthHeaders(customTokens, headers);
}

export * from './types.js';
