import type {CookieSerializeOptions} from 'cookie';
import {decodeJwt} from 'jose';
import {NextApiRequest} from 'next';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {ServiceAccount} from '../auth/credential.js';
import {ParsedTokens, VerifiedTokens} from '../auth/custom-token/index.js';
import {isInvalidTokenError} from '../auth/error.js';
import {getFirebaseAuth, Tokens} from '../auth/index.js';
import {mapJwtPayloadToDecodedIdToken} from '../auth/utils.js';
import {debug, enableDebugMode} from '../debug/index.js';
import {AuthCookies} from './cookies/AuthCookies.js';
import {CookieParserFactory} from './cookies/parser/CookieParserFactory.js';
import {RequestCookiesProvider} from './cookies/parser/RequestCookiesProvider.js';
import {CookiesObject, GetCookiesTokensOptions} from './cookies/types.js';
import {
  areCookiesVerifiedByMiddleware,
  isCookiesObjectVerifiedByMiddleware
} from './cookies/verification.js';
import {getReferer} from './utils.js';

export interface GetTokensOptions extends GetCookiesTokensOptions {
  cookieSerializeOptions?: CookieSerializeOptions;
  serviceAccount?: ServiceAccount;
  apiKey: string;
  debug?: boolean;
  headers?: Headers;
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

export async function getRequestCookiesTokens(
  cookies: RequestCookies | ReadonlyRequestCookies,
  options: GetCookiesTokensOptions
): Promise<ParsedTokens> {
  const parser = CookieParserFactory.fromRequestCookies(cookies, options);

  return await parser.parseCookies();
}

function toTokens(result: VerifiedTokens | null): Tokens | null {
  if (!result) {
    return null;
  }

  return {
    token: result.idToken,
    decodedToken: result.decodedIdToken,
    customToken: result.customToken
  };
}

function isReadonly(
  cookies: RequestCookies | ReadonlyRequestCookies
): cookies is ReadonlyRequestCookies {
  return !Object.hasOwn(cookies, 'set');
}

export async function getTokens(
  cookies: RequestCookies | ReadonlyRequestCookies,
  options: GetTokensOptions
): Promise<Tokens | null> {
  const now = Date.now();

  if (options.debug) {
    enableDebugMode();
  }

  validateOptions(options);

  const referer = options.headers ? getReferer(options.headers) : '';

  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  try {
    const tokens = await getRequestCookiesTokens(cookies, options);
    debug('getTokens: Tokens successfully extracted from cookies');

    if (areCookiesVerifiedByMiddleware(cookies)) {
      debug('getTokens: Cookies are marked as verified. Skipping verification');
      const payload = decodeJwt(tokens.idToken);

      return {
        token: tokens.idToken,
        decodedToken: mapJwtPayloadToDecodedIdToken(payload),
        customToken: tokens.customToken
      };
    }

    const result = await verifyAndRefreshExpiredIdToken(tokens, {
      referer,
      experimental_enableTokenRefreshOnExpiredKidHeader:
        options.experimental_enableTokenRefreshOnExpiredKidHeader,
      async onTokenRefresh({idToken, refreshToken, customToken}) {
        const cookieSerializeOptions = options.cookieSerializeOptions;

        if (isReadonly(cookies) || !cookieSerializeOptions) {
          debug(
            'getTokens: Expired tokens have been refreshed, but were not set on the response',
            {
              hasCookieSerializeOptions: !!cookieSerializeOptions,
              isReadonly: isReadonly(cookies)
            }
          );

          return;
        }

        debug(
          'getTokens: Expired tokens have been refreshed and new credentials will be set on the response'
        );

        const tokensToSign = {
          idToken,
          refreshToken,
          customToken
        };

        const setAuthCookiesOptions = {
          ...options,
          cookieSerializeOptions
        };
        const authCookies = new AuthCookies(
          RequestCookiesProvider.fromRequestCookies(cookies),
          setAuthCookiesOptions
        );

        await authCookies.setAuthCookies(tokensToSign, cookies);
      }
    });

    return toTokens(result);
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

export async function getCookiesTokens(
  cookies: CookiesObject,
  options: GetCookiesTokensOptions
): Promise<ParsedTokens> {
  const parser = CookieParserFactory.fromObject(cookies, options);

  return parser.parseCookies();
}

export async function getApiRequestTokens(
  request: NextApiRequest,
  options: GetTokensOptions
): Promise<Tokens | null> {
  const referer = request.headers.referer ?? '';
  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  try {
    const tokens = await getCookiesTokens(request.cookies, options);

    if (isCookiesObjectVerifiedByMiddleware(request.cookies)) {
      const payload = decodeJwt(tokens.idToken);

      return {
        token: tokens.idToken,
        decodedToken: mapJwtPayloadToDecodedIdToken(payload),
        customToken: tokens.customToken
      };
    }

    return toTokens(await verifyAndRefreshExpiredIdToken(tokens, {referer}));
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
export async function getTokensFromObject(
  cookies: CookiesObject,
  options: GetTokensOptions
): Promise<Tokens | null> {
  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  try {
    const tokens = await getCookiesTokens(cookies, options);

    if (isCookiesObjectVerifiedByMiddleware(cookies)) {
      const payload = decodeJwt(tokens.idToken);

      return {
        token: tokens.idToken,
        decodedToken: mapJwtPayloadToDecodedIdToken(payload),
        customToken: tokens.customToken
      };
    }

    return toTokens(
      await verifyAndRefreshExpiredIdToken(tokens, {
        referer: ''
      })
    );
  } catch (error: unknown) {
    if (isInvalidTokenError(error)) {
      return null;
    }

    throw error;
  }
}
