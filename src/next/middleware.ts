import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CookieSerializeOptions } from "cookie";
import { ServiceAccount } from "../auth/credential";
import {
  appendAuthCookies,
  removeAuthCookies,
  setAuthCookies,
} from "./cookies";
import { getRequestCookiesTokens, GetTokensOptions } from "./tokens";
import { getFirebaseAuth, handleExpiredToken, Tokens } from "../auth";
import { DecodedIdToken } from "../auth/token-verifier";

export interface CreateAuthMiddlewareOptions {
  loginPath: string;
  logoutPath: string;
  cookieName: string;
  cookieSignatureKeys: string[];
  cookieSerializeOptions: CookieSerializeOptions;
  serviceAccount: ServiceAccount;
  apiKey: string;
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
export type GetUnauthenticatedResponse = HandleInvalidToken;

export type HandleValidToken = (tokens: Tokens) => Promise<NextResponse>;
export type GetAuthenticatedResponse = HandleValidToken;

export type HandleError = (e: unknown) => Promise<NextResponse>;
export type GetErrorResponse = HandleError;

export interface AuthenticationOptions
  extends CreateAuthMiddlewareOptions,
    GetTokensOptions {
  checkRevoked?: boolean;
  isTokenValid?: (token: DecodedIdToken) => boolean;
  handleInvalidToken?: HandleInvalidToken;
  handleValidToken?: HandleValidToken;
  handleError?: HandleError;

  /** @deprecated Will be replaced by handleInvalidToken in v1.x.x **/
  redirectOptions?: RedirectToLoginOptions;
  /** @deprecated Will be replaced by handleInvalidToken in v1.x.x **/
  getUnauthenticatedResponse?: GetUnauthenticatedResponse;
  /** @deprecated Will be replaced by handleValidToken in v1.x.x **/
  getAuthenticatedResponse?: GetAuthenticatedResponse;
  /** @deprecated Will be replaced by handleError in v1.x.x **/
  getErrorResponse?: GetErrorResponse;
}

export interface RedirectToLoginOptions {
  paramName: string;
  path: string;
}

export function redirectToLogin(
  request: NextRequest,
  options: RedirectToLoginOptions
): NextResponse {
  const url = request.nextUrl.clone();
  const redirectUrl = url.pathname;
  url.pathname = options.path;
  url.search = `${options.paramName}=${redirectUrl}${url.search}`;
  return NextResponse.redirect(url);
}

function hasVerifiedEmail(token: DecodedIdToken) {
  return token.email_verified;
}

const defaultValidTokenHandler: HandleValidToken = async () =>
  NextResponse.next();
const getDefaultErrorHandler =
  (request: NextRequest, options?: RedirectToLoginOptions): HandleError =>
  async () =>
    options ? redirectToLogin(request, options) : NextResponse.next();

function redirectToLoginOrReturnEmptyResponse(
  request: NextRequest,
  options?: RedirectToLoginOptions
) {
  return options ? redirectToLogin(request, options) : NextResponse.next();
}

export async function authentication(
  request: NextRequest,
  options: AuthenticationOptions
): Promise<NextResponse> {
  if (options.redirectOptions && options.getUnauthenticatedResponse) {
    throw new Error(
      "You cannot use redirectOptions together with getUnauthenticatedResponse"
    );
  }

  if (options.redirectOptions && options.handleInvalidToken) {
    throw new Error(
      "You cannot use redirectOptions together with handleInvalidToken"
    );
  }

  const isTokenValid = options.isTokenValid ?? hasVerifiedEmail;
  const handleValidToken =
    options.handleValidToken ??
    options.getAuthenticatedResponse ??
    defaultValidTokenHandler;
  const handleError =
    options.handleError ??
    options.getErrorResponse ??
    getDefaultErrorHandler(request, options.redirectOptions);

  const handleInvalidToken =
    options.handleInvalidToken ??
    options.getUnauthenticatedResponse ??
    (() =>
      redirectToLoginOrReturnEmptyResponse(request, options.redirectOptions));

  if (
    [options.loginPath, options.logoutPath].includes(request.nextUrl.pathname)
  ) {
    return createAuthMiddlewareResponse(request, options);
  }

  if (
    options.redirectOptions &&
    request.nextUrl.pathname === options.redirectOptions.path
  ) {
    return NextResponse.next();
  }

  const { verifyIdToken, handleTokenRefresh } = getFirebaseAuth(
    options.serviceAccount,
    options.apiKey
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

      if (!isTokenValid(decodedToken)) {
        return handleInvalidToken();
      }

      return handleValidToken({
        token: idAndRefreshTokens.idToken,
        decodedToken,
      });
    },
    async () => {
      const { token, decodedToken } = await handleTokenRefresh(
        idAndRefreshTokens.refreshToken,
        options.apiKey
      );

      if (!isTokenValid(decodedToken)) {
        return handleInvalidToken();
      }

      return appendAuthCookies(
        await handleValidToken({ token, decodedToken }),
        {
          idToken: token,
          refreshToken: idAndRefreshTokens.refreshToken,
        },
        options
      );
    },
    async (e) => {
      return handleError(e);
    }
  );
}
