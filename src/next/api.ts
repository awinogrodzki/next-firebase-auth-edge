import type {IncomingHttpHeaders} from 'http';
import {NextApiRequest, NextApiResponse} from 'next';
import {ParsedTokens, VerifiedTokens} from '../auth/custom-token/index.js';
import {getFirebaseAuth} from '../auth/index.js';
import {AuthCookies} from './cookies/AuthCookies.js';
import {CookiesObject, SetAuthCookiesOptions} from './cookies/index.js';
import {ObjectCookiesProvider} from './cookies/parser/ObjectCookiesProvider.js';
import {getCookiesTokens} from './tokens.js';

export async function refreshApiResponseCookies<Metadata extends object>(
  request: NextApiRequest,
  response: NextApiResponse,
  options: SetAuthCookiesOptions<Metadata>
): Promise<NextApiResponse> {
  const tokens = await refreshApiCookies(
    request.cookies,
    request.headers,
    options
  );
  await appendAuthCookiesApi(request.cookies, response, tokens, options);

  return response;
}

export async function appendAuthCookiesApi<Metadata extends object>(
  cookies: CookiesObject,
  response: NextApiResponse,
  tokens: ParsedTokens,
  options: SetAuthCookiesOptions<Metadata>
) {
  const authCookies = new AuthCookies(
    new ObjectCookiesProvider(cookies),
    options
  );

  await authCookies.setAuthNextApiResponseHeaders(tokens, response);
}

export async function refreshApiCookies<Metadata extends object>(
  cookies: CookiesObject,
  headers: IncomingHttpHeaders,
  options: SetAuthCookiesOptions<Metadata>
): Promise<VerifiedTokens> {
  const referer = headers['referer'] ?? '';
  const tokens = await getCookiesTokens(cookies, options);
  const {handleTokenRefresh} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  const tokenRefreshResult = await handleTokenRefresh(tokens.refreshToken, {
    referer,
    enableCustomToken: options.enableCustomToken
  });

  return {
    customToken: tokenRefreshResult.customToken,
    idToken: tokenRefreshResult.idToken,
    refreshToken: tokenRefreshResult.refreshToken,
    decodedIdToken: tokenRefreshResult.decodedIdToken
  };
}
