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
import {debug, enableDebugMode} from '../debug';
import {
  areCookiesVerifiedByMiddleware,
  CookiesObject,
  isCookiesObjectVerifiedByMiddleware
} from './cookies';
import {InvalidTokenError, InvalidTokenReason} from '../auth/error';

export interface GetTokensOptions extends GetCookiesTokensOptions {
  serviceAccount?: ServiceAccount;
  apiKey: string;
  debug?: boolean;
}

export function validateOptions(options: GetTokensOptions) {
  if (!options.cookieSignatureKeys.length || !options.cookieSignatureKeys[0]) {
    throw new Error(
      `Expected cookieSignatureKeys to contain at least one signature key. Received: ${JSON.stringify(
        options.cookieSignatureKeys
      )}`
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
): Promise<IdAndRefreshTokens> {
  const signedCookie = cookies.get(options.cookieName);

  if (!signedCookie) {
    debug('Missing authentication cookies');

    throw new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS);
  }

  const tokens = await parseTokens(
    signedCookie.value,
    options.cookieSignatureKeys
  );

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
  if (options.debug) {
    enableDebugMode();
  }

  validateOptions(options);

  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey
  });

  try {
    const tokens = await getRequestCookiesTokens(cookies, options);

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
  } catch (error: unknown) {
    if (error instanceof InvalidTokenError) {
      debug(
        `Token is missing or has incorrect formatting. This is expected and usually means that user has not yet logged in`,
        {
          reason: error.reason
        }
      );
      return null;
    }

    throw error;
  }
}

export async function getCookiesTokens(
  cookies: Partial<{[K in string]: string}>,
  options: GetCookiesTokensOptions
): Promise<IdAndRefreshTokens> {
  const signedCookie = cookies[options.cookieName];

  if (!signedCookie) {
    throw new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS);
  }

  return await parseTokens(signedCookie, options.cookieSignatureKeys);
}

export async function getTokensFromObject(
  cookies: CookiesObject,
  options: GetTokensOptions
): Promise<Tokens | null> {
  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey
  });

  try {
    const tokens = await getCookiesTokens(cookies, options);

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
  } catch (error: unknown) {
    if (error instanceof InvalidTokenError) {
      return null;
    }

    throw error;
  }
}
