import {type CookieSerializeOptions, serialize} from 'cookie';
import type {IncomingHttpHeaders} from 'http';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {getFirebaseAuth} from '../auth';
import {SignedCookies, signCookies, signTokens} from '../auth/cookies/sign';
import {ServiceAccount} from '../auth/credential';
import {CustomTokens, VerifiedTokens} from '../auth/custom-token';
import {debug} from '../debug';
import {getCookiesTokens, getRequestCookiesTokens} from './tokens';
import {getReferer} from './utils';
import {AuthError, AuthErrorCode} from '../auth/error';

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

function generateEmptyCookies(
  options: RemoveAuthCookiesOptions,
  callback: (name: string) => void
) {
  if (options.enableMultipleCookies) {
    callback(options.cookieName);
    callback(`${options.cookieName}.custom`);
    callback(`${options.cookieName}.sig`);
    return;
  }

  callback(options.cookieName);
}

function generateCookies(
  cookies: SignedCookies,
  options: SetAuthCookiesOptions,
  callback: (name: string, value: string) => void
) {
  callback(options.cookieName, cookies.signed);
  callback(`${options.cookieName}.custom`, cookies.custom);
  callback(`${options.cookieName}.sig`, cookies.signature);
}

export function serializeCookies(
  cookies: SignedCookies,
  options: SetAuthCookiesOptions,
  callback: (setCookieHeader: string) => void
) {
  generateCookies(cookies, options, (name, value) => {
    callback(serialize(name, value, options.cookieSerializeOptions));
  });
}

function serializeEmptyCookies(
  options: RemoveAuthCookiesOptions,
  callback: (setCookieHeader: string) => void
) {
  const cookieOptions = options.cookieSerializeOptions;

  delete cookieOptions['maxAge'];
  delete cookieOptions['expires'];

  generateEmptyCookies(options, (name) => {
    callback(
      serialize(name, '', {
        ...cookieOptions,
        expires: new Date(0)
      })
    );
  });
}

export function appendCookies(
  cookies: RequestCookies | ReadonlyRequestCookies,
  signedCookies: SignedCookies,
  options: SetAuthCookiesOptions
) {
  generateCookies(signedCookies, options, (name, value) => {
    cookies.set(name, value);
  });
}

export function appendCookie(
  cookies: RequestCookies | ReadonlyRequestCookies,
  signedTokens: string,
  options: SetAuthCookiesOptions
) {
  cookies.set(options.cookieName, signedTokens);
}

export function appendHeaders(
  headers: Headers,
  signedCookies: SignedCookies,
  options: SetAuthCookiesOptions
) {
  serializeCookies(signedCookies, options, (value) =>
    headers.append('Set-Cookie', value)
  );
}

function serializeCookie(signedTokens: string, options: SetAuthCookiesOptions) {
  return serialize(
    options.cookieName,
    signedTokens,
    options.cookieSerializeOptions
  );
}

export function appendHeader(
  headers: Headers,
  signedTokens: string,
  options: SetAuthCookiesOptions
) {
  headers.append('Set-Cookie', serializeCookie(signedTokens, options));
}

export async function appendAuthCookies(
  response: NextResponse,
  tokens: CustomTokens,
  options: SetAuthCookiesOptions
) {
  debug('Updating response headers with authenticated cookies');

  const verifier = createVerifier(tokens, options);

  await verifier.init();

  verifier.appendHeaders(response.headers);
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

export function removeCookies(
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

  removeCookies(response, options);

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

interface HeaderVerifier {
  init(): Promise<void>;
  appendCookies: (cookies: RequestCookies | ReadonlyRequestCookies) => void;
  appendHeaders: (headers: Headers) => void;
}

class SingleHeaderVerifier implements HeaderVerifier {
  private signedTokens: string = '';

  constructor(
    private tokens: CustomTokens,
    private options: SetAuthCookiesOptions
  ) {}

  async init() {
    this.signedTokens = await signTokens(
      this.tokens,
      this.options.cookieSignatureKeys
    );
  }

  private validate() {
    if (!this.signedTokens) {
      throw new AuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Signed tokens are not assigned. Remember to await .init before calling append methods'
      );
    }
  }

  appendCookies(cookies: RequestCookies | ReadonlyRequestCookies) {
    this.validate();
    appendCookie(cookies, this.signedTokens, this.options);
  }

  appendHeaders(headers: Headers) {
    this.validate();
    appendHeader(headers, this.signedTokens, this.options);
  }
}

class MultiHeaderVerifier implements HeaderVerifier {
  private signedCookies: SignedCookies = {
    custom: '',
    signature: '',
    signed: ''
  };

  constructor(
    private tokens: CustomTokens,
    private options: SetAuthCookiesOptions
  ) {}

  async init() {
    this.signedCookies = await signCookies(
      this.tokens,
      this.options.cookieSignatureKeys
    );
  }

  private validate() {
    if (
      !this.signedCookies.signed ||
      !this.signedCookies.signature ||
      !this.signedCookies.custom
    ) {
      throw new AuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Signed cookies are not assigned. Remember to await .init before calling append methods'
      );
    }
  }

  appendCookies(cookies: RequestCookies | ReadonlyRequestCookies) {
    this.validate();
    appendCookies(cookies, this.signedCookies, this.options);
  }

  appendHeaders(headers: Headers) {
    this.validate();
    appendHeaders(headers, this.signedCookies, this.options);
  }
}

export function createVerifier(
  tokens: CustomTokens,
  options: SetAuthCookiesOptions
): HeaderVerifier {
  if (options.enableMultipleCookies) {
    return new MultiHeaderVerifier(tokens, options);
  }

  return new SingleHeaderVerifier(tokens, options);
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

  const verifier = createVerifier(customTokens, options);

  await verifier.init();

  verifier.appendCookies(request.cookies);

  const responseOrPromise = responseFactory({
    headers: request.headers,
    tokens: customTokens
  });

  const response =
    responseOrPromise instanceof Promise
      ? await responseOrPromise
      : responseOrPromise;

  verifier.appendHeaders(response.headers);

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

  const verifier = createVerifier(customTokens, options);

  await verifier.init();

  verifier.appendCookies(cookies);
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

  const verifier = createVerifier(customTokens, options);

  await verifier.init();

  verifier.appendCookies(cookies);
  verifier.appendHeaders(headers);
}
