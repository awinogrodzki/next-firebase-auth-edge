import {decodeJwt} from 'jose';
import {NextApiRequest} from 'next';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {Tokens, getFirebaseAuth} from '../auth';
import {parseCookies, parseTokens} from '../auth/cookies/sign';
import {ServiceAccount} from '../auth/credential';
import {CustomTokens, VerifiedTokens} from '../auth/custom-token';
import {InvalidTokenError, InvalidTokenReason} from '../auth/error';
import {mapJwtPayloadToDecodedIdToken} from '../auth/utils';
import {debug, enableDebugMode} from '../debug';
import {
  CookiesObject,
  areCookiesVerifiedByMiddleware,
  createVerifier,
  isCookiesObjectVerifiedByMiddleware
} from './cookies';
import {getReferer} from './utils';
import {CookieSerializeOptions} from 'cookie';

export interface GetTokensOptions extends GetCookiesTokensOptions {
  cookieSerializeOptions?: CookieSerializeOptions;
  serviceAccount?: ServiceAccount;
  apiKey: string;
  debug?: boolean;
  headers?: Headers;
  experimental_enableTokenRefreshOnExpiredKidHeader?: boolean;
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
): Promise<CustomTokens> {
  const signedCookie = cookies.get(options.cookieName);
  const signatureCookie = cookies.get(`${options.cookieName}.sig`);
  const customCookie = cookies.get(`${options.cookieName}.custom`);

  const enableMultipleCookies = signatureCookie?.value && customCookie?.value;

  if (!signedCookie?.value) {
    debug('Missing authentication cookies');

    throw new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS);
  }

  if (enableMultipleCookies) {
    return parseCookies(
      {
        signed: signedCookie.value,
        custom: customCookie.value,
        signature: signatureCookie.value
      },
      options.cookieSignatureKeys
    );
  }

  return parseTokens(signedCookie.value, options.cookieSignatureKeys);
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
    apiKey: options.apiKey
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

        const verifier = createVerifier(tokensToSign, {
          ...options,
          cookieSerializeOptions
        });

        await verifier.init();

        verifier.appendCookies(cookies);
      }
    });

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
  } finally {
    debug(`getTokens: took ${(Date.now() - now) / 1000}ms`);
  }
}

export async function getCookiesTokens(
  cookies: Partial<{[K in string]: string}>,
  options: GetCookiesTokensOptions
): Promise<CustomTokens> {
  const signedCookie = cookies[options.cookieName];
  const signatureCookie = cookies[`${options.cookieName}.sig`];
  const customCookie = cookies[`${options.cookieName}.custom`];
  const enableMultipleCookie = signatureCookie && customCookie;

  if (!signedCookie) {
    throw new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS);
  }

  if (enableMultipleCookie) {
    return await parseCookies(
      {
        signed: signedCookie,
        custom: customCookie,
        signature: signatureCookie
      },
      options.cookieSignatureKeys
    );
  }

  return await parseTokens(signedCookie, options.cookieSignatureKeys);
}

export async function getApiRequestTokens(
  request: NextApiRequest,
  options: GetTokensOptions
): Promise<Tokens | null> {
  const referer = request.headers.referer ?? '';
  const {verifyAndRefreshExpiredIdToken} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey
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
    if (error instanceof InvalidTokenError) {
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
    apiKey: options.apiKey
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
    if (error instanceof InvalidTokenError) {
      return null;
    }

    throw error;
  }
}
