import {type CookieSerializeOptions} from 'cookie';
import type {IncomingHttpHeaders} from 'http';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {ParsedCookies, VerifiedCookies} from '../../auth/custom-token/index.js';
import {getFirebaseAuth, TokenSet} from '../../auth/index.js';
import {debug} from '../../debug/index.js';
import {getCookiesTokens, getRequestCookiesTokens} from '../tokens.js';
import {getReferer} from '../utils.js';
import {AuthCookies} from './AuthCookies.js';
import {RequestCookiesProvider} from './parser/RequestCookiesProvider.js';
import {CookieExpirationFactory} from './expiration/CookieExpirationFactory.js';
import {CookiesObject, SetAuthCookiesOptions} from './types.js';
import {CookieRemoverFactory} from './remover/CookieRemoverFactory.js';
import {getMetadataInternal} from '../metadata.js';
import {mapJwtPayloadToDecodedIdToken} from '../../auth/utils.js';
import {decodeJwt} from 'jose';

export async function appendAuthCookies<Metadata extends object>(
  headers: Headers,
  response: NextResponse,
  value: ParsedCookies<Metadata>,
  options: SetAuthCookiesOptions<Metadata>
) {
  debug('Updating response headers with authenticated cookies');

  const authCookies = new AuthCookies(
    RequestCookiesProvider.fromHeaders(headers),
    options
  );

  await authCookies.setAuthHeaders(value, response.headers);
}

export async function setAuthCookies<Metadata extends object>(
  headers: Headers,
  options: SetAuthCookiesOptions<Metadata>
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
    referer,
    dynamicCustomClaimsKeys: options.dynamicCustomClaimsKeys
  });

  debug('Successfully generated custom tokens');

  const decodedIdToken = mapJwtPayloadToDecodedIdToken(
    decodeJwt(customTokens.idToken)
  );
  const metadata = await getMetadataInternal(
    {...customTokens, decodedIdToken},
    options
  );

  const response = new NextResponse(JSON.stringify({success: true}), {
    status: 200,
    headers: {'content-type': 'application/json'}
  });

  await appendAuthCookies(
    headers,
    response,
    {...customTokens, metadata},
    options
  );

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

export async function verifyApiCookies<Metadata extends object>(
  cookies: CookiesObject,
  headers: IncomingHttpHeaders,
  options: SetAuthCookiesOptions<Metadata>
): Promise<VerifiedCookies<Metadata>> {
  const tokens = await getCookiesTokens(cookies, options);
  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  const verifyTokenResult = await verifyAndRefreshExpiredIdToken(tokens, {
    referer: headers.referer ?? ''
  });

  const metadata = await getMetadataInternal<Metadata>(
    verifyTokenResult,
    options
  );

  return {...verifyTokenResult, metadata};
}

export async function verifyNextCookies<Metadata extends object>(
  cookies: RequestCookies | ReadonlyRequestCookies,
  headers: Headers,
  options: SetAuthCookiesOptions<Metadata>
): Promise<VerifiedCookies<Metadata>> {
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

  const metadata = await getMetadataInternal<Metadata>(
    verifyTokenResult,
    options
  );

  return {...verifyTokenResult, metadata};
}

export async function refreshNextCookies<Metadata extends object>(
  cookies: RequestCookies | ReadonlyRequestCookies,
  headers: Headers,
  options: SetAuthCookiesOptions<Metadata>
): Promise<VerifiedCookies<Metadata>> {
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

  const metadata = await getMetadataInternal<Metadata>(
    tokenRefreshResult,
    options
  );

  return {
    idToken: tokenRefreshResult.idToken,
    refreshToken: tokenRefreshResult.refreshToken,
    customToken: tokenRefreshResult.customToken,
    decodedIdToken: tokenRefreshResult.decodedIdToken,
    metadata
  };
}

export async function refreshCredentials<Metadata extends object>(
  request: NextRequest,
  options: SetAuthCookiesOptions<Metadata>,
  responseFactory: (options: {
    headers: Headers;
    tokens: TokenSet;
    metadata: Metadata;
  }) => NextResponse | Promise<NextResponse>
): Promise<NextResponse> {
  const value = await refreshNextCookies(
    request.cookies,
    request.headers,
    options
  );

  const cookies = new AuthCookies(
    RequestCookiesProvider.fromHeaders(request.headers),
    options
  );

  await cookies.setAuthCookies(value, request.cookies);

  const responseOrPromise = responseFactory({
    headers: request.headers,
    tokens: {
      idToken: value.idToken,
      decodedIdToken: value.decodedIdToken,
      refreshToken: value.refreshToken,
      customToken: value.customToken
    },
    metadata: value.metadata
  });

  const response =
    responseOrPromise instanceof Promise
      ? await responseOrPromise
      : responseOrPromise;

  await cookies.setAuthHeaders(value, response.headers);

  return response;
}

export async function refreshNextResponseCookiesWithToken<
  Metadata extends object
>(
  idToken: string,
  request: NextRequest,
  response: NextResponse,
  options: SetAuthCookiesOptions<Metadata>
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

  const decodedIdToken = mapJwtPayloadToDecodedIdToken(
    decodeJwt(customTokens.idToken)
  );
  const metadata = await getMetadataInternal<Metadata>(
    {...customTokens, decodedIdToken},
    options
  );

  await appendAuthCookies(
    request.headers,
    response,
    {...customTokens, metadata},
    options
  );

  return response;
}

export async function refreshCookiesWithIdToken<Metadata extends object>(
  idToken: string,
  headers: Headers,
  cookies: RequestCookies | ReadonlyRequestCookies,
  options: SetAuthCookiesOptions<Metadata>
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

  const decodedIdToken = mapJwtPayloadToDecodedIdToken(
    decodeJwt(customTokens.idToken)
  );

  const metadata = await getMetadataInternal<Metadata>(
    {...customTokens, decodedIdToken},
    options
  );

  const authCookies = new AuthCookies(
    RequestCookiesProvider.fromHeaders(headers),
    options
  );

  await authCookies.setAuthCookies({...customTokens, metadata}, cookies);
}

export async function refreshNextResponseCookies<Metadata extends object>(
  request: NextRequest,
  response: NextResponse,
  options: SetAuthCookiesOptions<Metadata>
): Promise<NextResponse> {
  const customTokens = await refreshNextCookies(
    request.cookies,
    request.headers,
    options
  );

  await appendAuthCookies(request.headers, response, customTokens, options);

  return response;
}

export async function refreshServerCookies<Metadata extends object>(
  cookies: RequestCookies | ReadonlyRequestCookies,
  headers: Headers,
  options: SetAuthCookiesOptions<Metadata>
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
