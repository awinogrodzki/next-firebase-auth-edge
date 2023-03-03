import { getFirebaseAuth, IdAndRefreshTokens } from "../auth";
import { ServiceAccount } from "../auth/credential";
import { sign } from "../auth/cookies/sign";
import { CookieSerializeOptions, serialize } from "cookie";
import { NextResponse } from "next/server";
import { getSignatureCookieName } from "../auth/cookies";
import { NextApiResponse } from "next";

export interface SetAuthCookiesOptions {
  cookieName: string;
  cookieSignatureKeys: string[];
  cookieSerializeOptions: CookieSerializeOptions;
  serviceAccount: ServiceAccount;
  apiKey: string;
}

export async function appendAuthCookiesApi(
  response: NextApiResponse,
  tokens: IdAndRefreshTokens,
  options: SetAuthCookiesOptions
) {
  const value = JSON.stringify(tokens);
  const { signatureCookie, signedCookie } = await sign(
    options.cookieSignatureKeys
  )({
    name: options.cookieName,
    value,
  });

  response.setHeader("Set-Cookie", [
    serialize(
      signatureCookie.name,
      signatureCookie.value,
      options.cookieSerializeOptions
    ),
    serialize(
      signedCookie.name,
      signedCookie.value,
      options.cookieSerializeOptions
    ),
  ]);
}

export async function appendAuthCookies(
  response: NextResponse,
  tokens: IdAndRefreshTokens,
  options: SetAuthCookiesOptions
) {
  const value = JSON.stringify(tokens);
  const { signatureCookie, signedCookie } = await sign(
    options.cookieSignatureKeys
  )({
    name: options.cookieName,
    value,
  });

  response.headers.append(
    "Set-Cookie",
    serialize(
      signatureCookie.name,
      signatureCookie.value,
      options.cookieSerializeOptions
    )
  );

  response.headers.append(
    "Set-Cookie",
    serialize(
      signedCookie.name,
      signedCookie.value,
      options.cookieSerializeOptions
    )
  );

  return response;
}

export async function refreshAuthCookies(
  idToken: string,
  response: NextApiResponse,
  options: SetAuthCookiesOptions
): Promise<IdAndRefreshTokens> {
  const { getCustomIdAndRefreshTokens } = getFirebaseAuth(
    options.serviceAccount,
    options.apiKey
  );
  const idAndRefreshTokens = await getCustomIdAndRefreshTokens(
    idToken,
    options.apiKey
  );

  await appendAuthCookiesApi(response, idAndRefreshTokens, options);

  return idAndRefreshTokens;
}

export async function setAuthCookies(
  headers: Headers,
  options: SetAuthCookiesOptions
): Promise<NextResponse> {
  const { getCustomIdAndRefreshTokens } = getFirebaseAuth(
    options.serviceAccount,
    options.apiKey
  );
  const token = headers.get("Authorization")?.split(" ")[1] ?? "";
  const idAndRefreshTokens = await getCustomIdAndRefreshTokens(
    token,
    options.apiKey
  );

  const response = new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

  return appendAuthCookies(response, idAndRefreshTokens, options);
}

export interface RemoveAuthCookiesOptions {
  cookieName: string;
  cookieSerializeOptions: CookieSerializeOptions;
}

export function removeAuthCookies(
  headers: Headers,
  options: RemoveAuthCookiesOptions
): NextResponse {
  const response = new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

  const { maxAge, expires, ...cookieOptions } = options.cookieSerializeOptions;

  response.headers.append(
    "Set-Cookie",
    serialize(options.cookieName, "", {
      ...cookieOptions,
      expires: new Date(0),
    })
  );

  response.headers.append(
    "Set-Cookie",
    serialize(getSignatureCookieName(options.cookieName), "", {
      ...cookieOptions,
      expires: new Date(0),
    })
  );

  return response;
}
