import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import {ServiceAccount} from '../auth/credential';
import {getSignatureCookieName} from '../auth/cookies';
import {
  getFirebaseAuth,
  IdAndRefreshTokens,
  Tokens,
  VerifyTokenResult
} from '../auth';
import {get} from '../auth/cookies/get';
import {decodeJwt} from 'jose';
import {mapJwtPayloadToDecodedIdToken} from '../auth/utils';
import {
  areCookiesVerifiedByMiddleware,
  CookiesObject,
  isCookiesObjectVerifiedByMiddleware
} from './cookies';
import {debug} from '../debug';

export interface GetTokensOptions extends GetCookiesTokensOptions {
  serviceAccount: ServiceAccount;
  apiKey: string;
}

export function validateOptions(options: GetTokensOptions) {
  if (!options.cookieSignatureKeys.length) {
    throw new Error(
      'You should provide at least one cookie signature encryption key'
    );
  }
}

export interface GetCookiesTokensOptions {
  cookieName: string;
  cookieSignatureKeys: string[];
}

export async function getRequestCookiesTokens(
  cookies: RequestCookies | ReadonlyRequestCookies,
  options: GetCookiesTokensOptions
): Promise<IdAndRefreshTokens | null> {
  const signed = cookies.get(options.cookieName);
  const signature = cookies.get(getSignatureCookieName(options.cookieName));

  if (!signed || !signature) {
    debug('Missing authentication cookies', {
      hasSignedCookie: String(Boolean(signed)),
      hasSignatureCookie: String(Boolean(signature)),
      signedCookieName: options.cookieName,
      signatureCookieName: getSignatureCookieName(options.cookieName)
    });

    return null;
  }

  const cookie = await get(options.cookieSignatureKeys)({
    signed,
    signature
  });

  if (!cookie?.value) {
    debug('Authentication cookies are present, but cannot be verified');
    return null;
  }

  debug('Authentication cookies are present and valid');
  return JSON.parse(cookie.value) as IdAndRefreshTokens;
}

function toTokens(result: VerifyTokenResult | null): Tokens | null {
  if (!result) {
    return null;
  }

  return {token: result.idToken, decodedToken: result.decodedIdToken};
}

export async function getTokens(
  cookies: RequestCookies | ReadonlyRequestCookies,
  options: GetTokensOptions
): Promise<Tokens | null> {
  validateOptions(options);

  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth(
    options.serviceAccount,
    options.apiKey
  );

  const tokens = await getRequestCookiesTokens(cookies, options);

  if (!tokens) {
    return null;
  }

  if (areCookiesVerifiedByMiddleware(cookies)) {
    const payload = decodeJwt(tokens.idToken);

    return {
      token: tokens.idToken,
      decodedToken: mapJwtPayloadToDecodedIdToken(payload)
    };
  }

  const result = await verifyAndRefreshExpiredIdToken(
    tokens.idToken,
    tokens.refreshToken
  );

  return toTokens(result);
}

export async function getCookiesTokens(
  cookies: Partial<{[K in string]: string}>,
  options: GetCookiesTokensOptions
): Promise<IdAndRefreshTokens | null> {
  const signedCookie = cookies[options.cookieName];
  const signatureCookie = cookies[getSignatureCookieName(options.cookieName)];

  if (!signedCookie || !signatureCookie) {
    return null;
  }

  const cookie = await get(options.cookieSignatureKeys)({
    signed: {
      name: options.cookieName,
      value: signedCookie
    },
    signature: {
      name: getSignatureCookieName(options.cookieName),
      value: signatureCookie
    }
  });

  if (!cookie?.value) {
    return null;
  }

  return JSON.parse(cookie.value) as IdAndRefreshTokens;
}

export async function getTokensFromObject(
  cookies: CookiesObject,
  options: GetTokensOptions
): Promise<Tokens | null> {
  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth(
    options.serviceAccount,
    options.apiKey
  );

  const tokens = await getCookiesTokens(cookies, options);

  if (!tokens) {
    return null;
  }

  if (isCookiesObjectVerifiedByMiddleware(cookies)) {
    const payload = decodeJwt(tokens.idToken);

    return {
      token: tokens.idToken,
      decodedToken: mapJwtPayloadToDecodedIdToken(payload)
    };
  }

  return toTokens(
    await verifyAndRefreshExpiredIdToken(tokens.idToken, tokens.refreshToken)
  );
}
