import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';
import { ServiceAccount } from '../auth/credential';
import { getSignatureCookieName } from '../auth/cookies';
import { getFirebaseAuth, IdAndRefreshTokens, Tokens } from '../auth';
import { get } from '../auth/cookies/get';

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

export async function getTokens(cookies: RequestCookies, options: GetTokensOptions): Promise<Tokens|null> {
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
