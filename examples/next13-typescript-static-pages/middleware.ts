import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  authentication,
  refreshAuthCookies,
} from "next-firebase-auth-edge/lib/next/middleware";
import { authConfig } from "./config/server-config";
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

const { setCustomUserClaims, getUser } = getFirebaseAuth(
  authConfig.serviceAccount,
  authConfig.apiKey
);

export async function middleware(request: NextRequest) {
  return authentication(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    ...authConfig,
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

        await refreshAuthCookies(token, response, authConfig);
        return response;
      }

      return NextResponse.next();
    },
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
