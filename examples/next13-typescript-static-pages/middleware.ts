import type { NextRequest } from "next/server";
import {
  authentication,
  redirectToLogin,
  RedirectToLoginOptions,
} from "next-firebase-auth-edge/lib/next/middleware";
import { serverConfig } from "./config/server-config";

export async function middleware(request: NextRequest) {
  return authentication(request, {
    redirectOptions: {
      path: "/login",
      paramName: "redirect",
    },
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: serverConfig.firebaseApiKey,
    cookieName: "AuthToken",
    cookieSignatureKeys: ["secret1", "secret2"],
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: false, // Set this to true on HTTPS environments
      sameSite: "strict" as const,
      maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
    },
    serviceAccount: serverConfig.serviceAccount,
    isTokenValid: (token) => token.email_verified ?? false,
  });
}

export const config = {
  matcher: ["/", "/((?!_next/static|favicon.ico|logo.svg).*)"],
};
