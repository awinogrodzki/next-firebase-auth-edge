import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';
import { ServiceAccount } from '../auth/credential';
import { getSignatureCookieName } from '../auth/cookies';
import { getFirebaseAuth, IdAndRefreshTokens, Tokens } from '../auth';
import { get } from '../auth/cookies/get';
import { ReadonlyRequestCookies } from 'next/dist/server/app-render';

export interface GetTokensOptions {
  cookieName: string;
  cookieSignatureKeys: string[];
  serviceAccount: ServiceAccount;
  apiKey: string;
}

function validateOptions(options: GetTokensOptions) {
  if (!options.cookieSignatureKeys.length) {
    throw new Error('You should provide at least one cookie signature encryption key');
  }
}

export async function getTokens(cookies: RequestCookies | ReadonlyRequestCookies, options: GetTokensOptions): Promise<Tokens|null> {
  validateOptions(options);

  const { verifyAndRefreshExpiredIdToken } = getFirebaseAuth(options.serviceAccount, options.apiKey);
  const signedCookie = cookies.get(options.cookieName);
  const signatureCookie = cookies.get(getSignatureCookieName(options.cookieName));

  if (!signedCookie || !signatureCookie) {
    return null;
  }

  const cookie = await get(options.cookieSignatureKeys)({ signedCookie, signatureCookie });

  if (!cookie?.value) {
    return null;
  }

  const { idToken, refreshToken } = JSON.parse(cookie.value) as IdAndRefreshTokens;

  return verifyAndRefreshExpiredIdToken(idToken, refreshToken);
}

export async function getTokensFromObject(
  cookies: Partial<{ [K in string]: string }>,
  options: GetTokensOptions
): Promise<Tokens | null> {
  const { verifyAndRefreshExpiredIdToken } = getFirebaseAuth(
    options.serviceAccount,
    options.apiKey
  );
  const signedCookie = cookies[options.cookieName];
  const signatureCookie = cookies[getSignatureCookieName(options.cookieName)];

  if (!signedCookie || !signatureCookie) {
    return null;
  }

  const cookie = await get(options.cookieSignatureKeys)({
    signedCookie: {
      name: options.cookieName,
      value: signedCookie,
    },
    signatureCookie: {
      name: getSignatureCookieName(options.cookieName),
      value: signatureCookie,
    },
  });

  if (!cookie?.value) {
    return null;
  }

  const { idToken, refreshToken } = JSON.parse(cookie.value) as IdAndRefreshTokens;

  return verifyAndRefreshExpiredIdToken(idToken, refreshToken);
}
