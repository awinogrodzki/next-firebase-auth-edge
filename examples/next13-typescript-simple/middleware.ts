import type { NextRequest } from "next/server";
import {
  authentication,
  redirectToLogin,
  RedirectToLoginOptions,
} from "next-firebase-auth-edge/lib/next/middleware";
import { serverConfig } from "./app/server-config";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const redirectOptions: RedirectToLoginOptions = {
    path: "/login",
    paramName: "redirect",
  };

  return authentication(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: serverConfig.firebaseApiKey,
    cookieName: "AuthToken",
    cookieSignatureKeys: ["secret1", "secret2"],
    redirectOptions,
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: false, // Set this to true on HTTPS environments
      sameSite: "strict" as const,
      maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
    },
    serviceAccount: serverConfig.serviceAccount,
    isTokenValid: (token) => Boolean(token),
    getAuthenticatedResponse: (tokens) => {
      console.log("Successfully authenticated", { tokens });
      return NextResponse.next();
    },
    getErrorResponse: (error) => {
      console.error("Oops, this should not have happened.", { error });
      return redirectToLogin(request, redirectOptions);
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico|logo.svg).*)"],
};
