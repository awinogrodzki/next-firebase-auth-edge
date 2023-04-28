import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  authentication,
  refreshAuthCookies,
} from "next-firebase-auth-edge/lib/next/middleware";
import { serverConfig } from "./config/server-config";
import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";

function redirectToLogin(request: NextRequest) {
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `redirect=${request.nextUrl.pathname}${url.search}`;
  return NextResponse.redirect(url);
}

const commonOptions = {
  apiKey: serverConfig.firebaseApiKey,
  cookieName: "AuthToken",
  cookieSignatureKeys: ["secret1", "secret2"],
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: serverConfig.useSecureCookies, // Set this to true on HTTPS environments
    sameSite: "lax" as const,
    maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
  },
  serviceAccount: serverConfig.serviceAccount,
};

const { setCustomUserClaims, getUser } = getFirebaseAuth(
  commonOptions.serviceAccount,
  commonOptions.apiKey
);

export async function middleware(request: NextRequest) {
  return authentication(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    ...commonOptions,
    handleValidToken: async ({ token, decodedToken }) => {
      if (request.nextUrl.pathname === "/api/custom-claims") {
        await setCustomUserClaims(decodedToken.uid, {
          someClaims: ["someValue"],
        });

        const user = await getUser(decodedToken.uid);
        const response = new NextResponse(JSON.stringify(user.customClaims), {
          status: 200,
          headers: { "content-type": "application/json" },
        });

        await refreshAuthCookies(token, response, commonOptions);
        return response;
      }

      return NextResponse.next();
    },
    isTokenValid: (token) => token.email_verified ?? false,
    handleInvalidToken: async () => {
      return redirectToLogin(request);
    },
    handleError: async (error) => {
      console.error("Unhandled authentication error", { error });
      return redirectToLogin(request);
    },
  });
}

export const config = {
  matcher: ["/", "/((?!_next/static|favicon.ico|logo.svg).*)"],
};
