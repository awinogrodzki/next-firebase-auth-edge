import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CookieSerializeOptions } from "cookie";
import { ServiceAccount } from "../auth/credential";
import {
  appendAuthCookies,
  markCookiesAsVerified,
  removeAuthCookies,
  setAuthCookies,
  SetAuthCookiesOptions,
  toSignedCookies,
  updateRequestAuthCookies,
  updateResponseAuthCookies,
  removeInternalVerifiedCookieIfExists,
  wasResponseDecoratedWithModifiedRequestHeaders,
} from "./cookies";
import { getRequestCookiesTokens, GetTokensOptions } from "./tokens";
import {
  getFirebaseAuth,
  handleExpiredToken,
  IdAndRefreshTokens,
  Tokens,
} from "../auth";

export interface CreateAuthMiddlewareOptions {
  loginPath: string;
  logoutPath: string;
  cookieName: string;
  cookieSignatureKeys: string[];
  cookieSerializeOptions: CookieSerializeOptions;
  serviceAccount: ServiceAccount;
  apiKey: string;
  tenantId?: string;
}

export async function createAuthMiddlewareResponse(
  request: NextRequest,
  options: CreateAuthMiddlewareOptions
): Promise<NextResponse> {
  if (request.nextUrl.pathname === options.loginPath) {
    return setAuthCookies(request.headers, {
      cookieName: options.cookieName,
      cookieSerializeOptions: options.cookieSerializeOptions,
      cookieSignatureKeys: options.cookieSignatureKeys,
      serviceAccount: options.serviceAccount,
      apiKey: options.apiKey,
      tenantId: options.tenantId,
    });
  }

  if (request.nextUrl.pathname === options.logoutPath) {
    return removeAuthCookies(request.headers, {
      cookieName: options.cookieName,
      cookieSerializeOptions: options.cookieSerializeOptions,
    });
  }

  return NextResponse.next();
}

export type HandleInvalidToken = () => Promise<NextResponse>;
export type HandleValidToken = (
  tokens: Tokens,
  headers: Headers
) => Promise<NextResponse>;
export type HandleError = (e: unknown) => Promise<NextResponse>;

export interface AuthenticationOptions
  extends CreateAuthMiddlewareOptions,
    GetTokensOptions {
  checkRevoked?: boolean;
  handleInvalidToken?: HandleInvalidToken;
  handleValidToken?: HandleValidToken;
  handleError?: HandleError;
}

export async function refreshAuthCookies(
  idToken: string,
  response: NextResponse,
  options: SetAuthCookiesOptions
): Promise<IdAndRefreshTokens> {
  const { getCustomIdAndRefreshTokens } = getFirebaseAuth(
    options.serviceAccount,
    options.apiKey,
    options.tenantId
  );
  const idAndRefreshTokens = await getCustomIdAndRefreshTokens(
    idToken,
    options.apiKey
  );

  await appendAuthCookies(response, idAndRefreshTokens, options);

  return idAndRefreshTokens;
}

const defaultInvalidTokenHandler = async () => NextResponse.next();

const defaultValidTokenHandler: HandleValidToken = async (
  _tokens: Tokens,
  headers: Headers
) =>
  NextResponse.next({
    request: {
      headers,
    },
  });

function validateResponse(response: NextResponse) {
  if (!wasResponseDecoratedWithModifiedRequestHeaders(response)) {
    console.warn(
      `– \x1b[33mwarn\x1b[0m next-firebase-auth-edge: NextResponse returned by handleValidToken was not decorated by modified request headers. This can cause token verification to happen multiple times in a single request. See: https://github.com/awinogrodzki/next-firebase-auth-edge#middleware-token-verification-caching`
    );
  }
}

export async function authentication(
  request: NextRequest,
  options: AuthenticationOptions
): Promise<NextResponse> {
  const handleValidToken = options.handleValidToken ?? defaultValidTokenHandler;
  const handleError = options.handleError ?? defaultInvalidTokenHandler;

  const handleInvalidToken =
    options.handleInvalidToken ?? defaultInvalidTokenHandler;

  removeInternalVerifiedCookieIfExists(request.cookies);

  if (
    [options.loginPath, options.logoutPath].includes(request.nextUrl.pathname)
  ) {
    return createAuthMiddlewareResponse(request, options);
  }

  const { verifyIdToken, handleTokenRefresh } = getFirebaseAuth(
    options.serviceAccount,
    options.apiKey,
    options.tenantId
  );

  const idAndRefreshTokens = await getRequestCookiesTokens(
    request.cookies,
    options
  );

  if (!idAndRefreshTokens) {
    return handleInvalidToken();
  }

  return handleExpiredToken(
    async () => {
      const decodedToken = await verifyIdToken(
        idAndRefreshTokens.idToken,
        options.checkRevoked
      );

      markCookiesAsVerified(request.cookies);
      const response = await handleValidToken(
        {
          token: idAndRefreshTokens.idToken,
          decodedToken,
        },
        request.headers
      );

      if (!response.headers.has("location")) {
        validateResponse(response);
      }

      return response;
    },
    async () => {
      const { token, decodedToken } = await handleTokenRefresh(
        idAndRefreshTokens.refreshToken,
        options.apiKey
      );

      const signedCookies = await toSignedCookies(
        {
          idToken: token,
          refreshToken: idAndRefreshTokens.refreshToken,
        },
        options
      );

      updateRequestAuthCookies(request, signedCookies);
      markCookiesAsVerified(request.cookies);
      const response = await handleValidToken(
        { token, decodedToken },
        request.headers
      );

      validateResponse(response);

      return updateResponseAuthCookies(
        response,
        signedCookies,
        options.cookieSerializeOptions
      );
    },
    async (e) => {
      return handleError(e);
    }
  );
}
