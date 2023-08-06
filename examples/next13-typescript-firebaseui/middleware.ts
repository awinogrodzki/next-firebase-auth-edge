import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authentication } from "next-firebase-auth-edge/lib/next/middleware";
import { authConfig } from "./config/server-config";

export async function middleware(request: NextRequest) {
  return authentication(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    cookieSerializeOptions: authConfig.cookieSerializeOptions,
    serviceAccount: authConfig.serviceAccount,
    handleValidToken: async ({ token, decodedToken }) => {
      console.log("Successfully authenticated", { token, decodedToken });
      return NextResponse.next();
    },
    handleError: async (error) => {
      console.error("Oops, this should not have happened.", { error });
      return NextResponse.next();
    },
  });
}

export const config = {
  matcher: ["/", "/((?!_next|favicon.ico|api|.*\\.).*)", "/api/login", "/api/logout"],
};

