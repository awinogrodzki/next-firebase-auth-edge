import type {CookieSerializeOptions} from 'cookie';
import {decodeJwt} from 'jose';
import {NextApiRequest} from 'next';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {ServiceAccount} from '../auth/credential.js';
import {ParsedCookies} from '../auth/custom-token/index.js';
import {isInvalidTokenError} from '../auth/error.js';
import {Tokens} from '../auth/index.js';
import {mapJwtPayloadToDecodedIdToken} from '../auth/utils.js';
import {debug, enableDebugMode} from '../debug/index.js';
import {CookieParserFactory} from './cookies/parser/CookieParserFactory.js';
import {CookiesObject, GetCookiesTokensOptions} from './cookies/types.js';
import {
  areCookiesVerifiedByMiddleware,
  isCookiesObjectVerifiedByMiddleware
} from './cookies/verification.js';

export interface GetTokensOptions extends GetCookiesTokensOptions {
  cookieSerializeOptions?: CookieSerializeOptions;
  serviceAccount?: ServiceAccount;
  apiKey: string;
  debug?: boolean;
  experimental_enableTokenRefreshOnExpiredKidHeader?: boolean;
  tenantId?: string;
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

export function getRequestCookiesTokens<Metadata extends object>(
  cookies: RequestCookies | ReadonlyRequestCookies,
  options: GetCookiesTokensOptions
): Promise<ParsedCookies<Metadata>> {
  const parser = CookieParserFactory.fromRequestCookies<Metadata>(
    cookies,
    options
  );

  return parser.parseCookies();
}

export async function getTokens<Metadata extends object>(
  cookies: RequestCookies | ReadonlyRequestCookies,
  options: GetTokensOptions
): Promise<Tokens<Metadata> | null> {
  const now = Date.now();

  if (options.debug) {
    enableDebugMode();
  }

  validateOptions(options);

  try {
    const tokens = await getRequestCookiesTokens<Metadata>(cookies, options);
    debug('getTokens: Tokens successfully extracted from cookies');

    if (areCookiesVerifiedByMiddleware(cookies)) {
      debug('getTokens: Cookies are marked as verified.');
    } else {
      console.warn(
        '⚠️ next-firebase-auth-edge:',
        'Called `getTokens`, but the request cookies were not verified by Middleware.',
        'Ensure that Middleware is enabled for this route before calling `getTokens` to avoid authentication issues.'
      );
    }

    const payload = decodeJwt(tokens.idToken);

    return {
      token: tokens.idToken,
      decodedToken: mapJwtPayloadToDecodedIdToken(payload),
      customToken: tokens.customToken,
      metadata: tokens.metadata
    };
  } catch (error: unknown) {
    if (isInvalidTokenError(error)) {
      debug(
        `Token is missing or has incorrect formatting. This is expected and usually means that user has not yet logged in`,
        {
          reason: error.reason
        }
      );
      return null;
    }

    throw error;
  } finally {
    debug(`getTokens: took ${(Date.now() - now) / 1000}ms`);
  }
}

export function getCookiesTokens<Metadata extends object>(
  cookies: CookiesObject,
  options: GetCookiesTokensOptions
): Promise<ParsedCookies<Metadata>> {
  const parser = CookieParserFactory.fromObject<Metadata>(cookies, options);

  return parser.parseCookies();
}

export async function getApiRequestTokens<Metadata extends object>(
  request: NextApiRequest,
  options: GetTokensOptions
): Promise<Tokens<Metadata> | null> {
  try {
    const tokens = await getCookiesTokens<Metadata>(request.cookies, options);

    if (!isCookiesObjectVerifiedByMiddleware(request.cookies)) {
      console.warn(
        '⚠️ next-firebase-auth-edge:',
        'Called `getTokens`, but the request cookies were not verified by Middleware.',
        'Ensure that Middleware is enabled for this route before calling `getTokens` to avoid authentication issues.'
      );
    }

    const payload = decodeJwt(tokens.idToken);

    return {
      token: tokens.idToken,
      decodedToken: mapJwtPayloadToDecodedIdToken(payload),
      customToken: tokens.customToken,
      metadata: tokens.metadata
    };
  } catch (error: unknown) {
    if (isInvalidTokenError(error)) {
      return null;
    }

    throw error;
  }
}

/**
 * @deprecated
 * Use `getApiRequestTokens` instead
 */
export async function getTokensFromObject<Metadata extends object>(
  cookies: CookiesObject,
  options: GetTokensOptions
): Promise<Tokens<Metadata> | null> {
  try {
    const tokens = await getCookiesTokens<Metadata>(cookies, options);

    if (!isCookiesObjectVerifiedByMiddleware(cookies)) {
      console.warn(
        '⚠️ next-firebase-auth-edge:',
        'Called `getTokens`, but the request cookies were not verified by Middleware.',
        'Ensure that Middleware is enabled for this route before calling `getTokens` to avoid authentication issues.'
      );
    }

    const payload = decodeJwt(tokens.idToken);

    return {
      token: tokens.idToken,
      decodedToken: mapJwtPayloadToDecodedIdToken(payload),
      customToken: tokens.customToken,
      metadata: tokens.metadata
    };
  } catch (error: unknown) {
    if (isInvalidTokenError(error)) {
      return null;
    }

    throw error;
  }
}
