import {CookieSerializeOptions, serialize} from 'cookie';
import {NextApiRequest, NextApiResponse} from 'next';
import {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {NextRequest, NextResponse} from 'next/server';
import {IdAndRefreshTokens, VerifyTokenResult, getFirebaseAuth} from '../auth';
import {signTokens} from '../auth/cookies/sign';
import {ServiceAccount} from '../auth/credential';
import {debug} from '../debug';
import {getCookiesTokens, getRequestCookiesTokens} from './tokens';

export interface SetAuthCookiesOptions {
  cookieName: string;
  cookieSignatureKeys: string[];
  cookieSerializeOptions: CookieSerializeOptions;
  serviceAccount?: ServiceAccount;
  apiKey: string;
  tenantId?: string;
  appCheckToken?: string;
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
  tokens: IdAndRefreshTokens,
  options: SetAuthCookiesOptions
) {
  const signedTokens = await signTokens(tokens, options.cookieSignatureKeys);

  response.setHeader('Set-Cookie', [
    serialize(options.cookieName, signedTokens, options.cookieSerializeOptions)
  ]);
}

export async function appendAuthCookies(
  response: NextResponse,
  tokens: IdAndRefreshTokens,
  options: SetAuthCookiesOptions
) {
  const signedTokens = await signTokens(tokens, options.cookieSignatureKeys);

  debug('Updating response headers with authenticated cookies');

  response.headers.append(
    'Set-Cookie',
    serialize(options.cookieName, signedTokens, options.cookieSerializeOptions)
  );
}

/**
 * @deprecated
 * Use `refreshApiResponseCookies` from `next-firebase-auth-edge/lib/next/cookies` instead
 */
export async function refreshAuthCookies(
  idToken: string,
  response: NextApiResponse,
  options: SetAuthCookiesOptions
): Promise<IdAndRefreshTokens> {
  const {getCustomIdAndRefreshTokens} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });
  const idAndRefreshTokens = await getCustomIdAndRefreshTokens(
    idToken,
    options.apiKey
  );

  await appendAuthCookiesApi(response, idAndRefreshTokens, options);

  return idAndRefreshTokens;
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
  const appCheckToken = headers.get('X-Firebase-AppCheck') ?? undefined;
  const idAndRefreshTokens = await getCustomIdAndRefreshTokens(
    token,
    appCheckToken
  );

  debug('Successfully generated custom tokens');

  const response = new NextResponse(JSON.stringify({success: true}), {
    status: 200,
    headers: {'content-type': 'application/json'}
  });

  await appendAuthCookies(response, idAndRefreshTokens, options);

  return response;
}

export interface RemoveAuthCookiesOptions {
  cookieName: string;
  cookieSerializeOptions: CookieSerializeOptions;
}

export function removeAuthCookies(
  _headers: Headers,
  options: RemoveAuthCookiesOptions
): NextResponse {
  const response = new NextResponse(JSON.stringify({success: true}), {
    status: 200,
    headers: {'content-type': 'application/json'}
  });

  const {maxAge, expires, ...cookieOptions} = options.cookieSerializeOptions;

  response.headers.append(
    'Set-Cookie',
    serialize(options.cookieName, '', {
      ...cookieOptions,
      expires: new Date(0)
    })
  );

  debug('Updating response with empty authentication cookie headers', {
    cookieName: options.cookieName
  });

  return response;
}

export async function verifyApiCookies(
  cookies: Partial<{
    [key: string]: string;
  }>,
  options: SetAuthCookiesOptions
): Promise<VerifyTokenResult | null> {
  const tokens = await getCookiesTokens(cookies, options);

  if (!tokens) {
    return null;
  }

  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  const verifyTokenResult = await verifyAndRefreshExpiredIdToken(
    tokens.idToken,
    tokens.refreshToken
  );

  if (!verifyTokenResult) {
    return null;
  }

  return verifyTokenResult;
}

export async function refreshApiCookies(
  cookies: Partial<{
    [key: string]: string;
  }>,
  options: SetAuthCookiesOptions
): Promise<VerifyTokenResult | null> {
  const tokens = await getCookiesTokens(cookies, options);

  if (!tokens) {
    return null;
  }

  const {handleTokenRefresh} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  const verifyTokenResult = await handleTokenRefresh(tokens.refreshToken);

  if (!verifyTokenResult) {
    return null;
  }

  return verifyTokenResult;
}

export async function refreshApiResponseCookies(
  request: NextApiRequest,
  response: NextApiResponse,
  options: SetAuthCookiesOptions
): Promise<NextApiResponse> {
  const verifyTokenResult = await refreshApiCookies(request.cookies, options);

  if (!verifyTokenResult) {
    return response;
  }

  await appendAuthCookiesApi(response, verifyTokenResult, options);

  return response;
}

export async function verifyNextCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  options: SetAuthCookiesOptions
): Promise<VerifyTokenResult | null> {
  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  const tokens = await getRequestCookiesTokens(cookies, options);

  if (!tokens) {
    return null;
  }

  const verifyTokenResult = await verifyAndRefreshExpiredIdToken(
    tokens.idToken,
    tokens.refreshToken
  );

  if (!verifyTokenResult) {
    return null;
  }

  return verifyTokenResult;
}

export async function refreshNextCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  options: SetAuthCookiesOptions
): Promise<VerifyTokenResult | null> {
  const {handleTokenRefresh} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  const tokens = await getRequestCookiesTokens(cookies, options);

  if (!tokens) {
    return null;
  }

  const verifyTokenResult = await handleTokenRefresh(tokens.refreshToken);

  if (!verifyTokenResult) {
    return null;
  }

  return verifyTokenResult;
}

export async function refreshNextResponseCookies(
  request: NextRequest,
  response: NextResponse,
  options: SetAuthCookiesOptions
): Promise<NextResponse> {
  const verifyTokenResult = await refreshNextCookies(request.cookies, options);

  if (!verifyTokenResult) {
    return response;
  }

  await appendAuthCookies(response, verifyTokenResult, options);

  return response;
}

export async function refreshServerCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  options: SetAuthCookiesOptions
): Promise<void> {
  const verifyTokenResult = await refreshNextCookies(cookies, options);

  if (!verifyTokenResult) {
    return;
  }

  const signedTokens = await signTokens(
    verifyTokenResult,
    options.cookieSignatureKeys
  );

  cookies.set(options.cookieName, signedTokens, options.cookieSerializeOptions);
}
