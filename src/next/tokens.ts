import {decodeJwt} from 'jose';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {
  getFirebaseAuth,
  IdAndRefreshTokens,
  Tokens,
  VerifyTokenResult
} from '../auth';
import {parseTokens} from '../auth/cookies/sign';
import {ServiceAccount} from '../auth/credential';
import {mapJwtPayloadToDecodedIdToken} from '../auth/utils';
import {debug} from '../debug';
import {
  areCookiesVerifiedByMiddleware,
  CookiesObject,
  isCookiesObjectVerifiedByMiddleware
} from './cookies';

export interface GetTokensOptions extends GetCookiesTokensOptions {
  serviceAccount?: ServiceAccount;
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
  const signedCookie = cookies.get(options.cookieName);

  if (!signedCookie) {
    debug('Missing authentication cookies');

    return null;
  }

  const tokens = await parseTokens(
    signedCookie.value,
    options.cookieSignatureKeys
  );

  if (!tokens) {
    debug('Authentication cookies are present, but cannot be verified');
    return null;
  }

  debug('Authentication cookies are present and valid');
  return tokens;
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

  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey
  });

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

  if (!signedCookie) {
    return null;
  }

  const tokens = await parseTokens(signedCookie, options.cookieSignatureKeys);

  if (!tokens) {
    return null;
  }

  return tokens;
}

export async function getTokensFromObject(
  cookies: CookiesObject,
  options: GetTokensOptions
): Promise<Tokens | null> {
  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey
  });

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
