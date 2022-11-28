import { getFirebaseAuth } from '../auth';
import { ServiceAccount } from '../auth/credential';
import { sign } from '../auth/cookies/sign';
import { CookieSerializeOptions, serialize } from 'cookie';
import { NextResponse } from 'next/server';
import { getSignatureCookieName } from '../auth/cookies';

export interface SetAuthCookiesOptions {
  cookieName: string;
  cookieSignatureKeys: string[];
  cookieSerializeOptions: CookieSerializeOptions;
  serviceAccount: ServiceAccount;
  apiKey: string;
}

export async function setAuthCookies(headers: Headers, options: SetAuthCookiesOptions): Promise<NextResponse> {
  const {getCustomIdAndRefreshTokens} = getFirebaseAuth(options.serviceAccount, options.apiKey)
  const token = headers.get('Authorization')?.split(' ')[1] ?? '';
  const { idToken, refreshToken } = await getCustomIdAndRefreshTokens(
    token,
    options.apiKey
  );
  const value = JSON.stringify({ idToken, refreshToken });
  const { signatureCookie, signedCookie } = await sign(options.cookieSignatureKeys)({
    name: options.cookieName,
    value,
  });

  const response = new NextResponse(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  )

  response.headers.append(
    'Set-Cookie',
    serialize(signatureCookie.name, signatureCookie.value, options.cookieSerializeOptions)
  );

  response.headers.append(
    'Set-Cookie',
    serialize(signedCookie.name, signedCookie.value, options.cookieSerializeOptions)
  );

  return response;
}

export interface RemoveAuthCookiesOptions {
  cookieName: string;
  cookieSerializeOptions: CookieSerializeOptions;
}

export function removeAuthCookies(headers: Headers, options: RemoveAuthCookiesOptions): NextResponse {
  const response = new NextResponse(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );

  response.headers.append(
    'Set-Cookie',
    serialize(options.cookieName, '', {
      ...options.cookieSerializeOptions,
      expires: new Date(0),
    })
  );

  response.headers.append(
    'Set-Cookie',
    serialize(getSignatureCookieName(options.cookieName), '', {
      ...options.cookieSerializeOptions,
      expires: new Date(0),
    })
  );

  return response;
}
