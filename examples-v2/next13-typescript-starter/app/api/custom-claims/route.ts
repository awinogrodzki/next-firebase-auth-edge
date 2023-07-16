import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "../../../config/server-config";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { refreshAuthCookies } from "next-firebase-auth-edge/lib/next/middleware";
import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";

const { setCustomUserClaims, getUser } = getFirebaseAuth(
  authConfig.serviceAccount,
  authConfig.apiKey
);

export async function POST(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

  if (!tokens) {
    throw new Error("Cannot update custom claims of unauthenticated user");
  }

  await setCustomUserClaims(tokens.decodedToken.uid, {
    someCustomClaim: {
      updatedAt: Date.now(),
    },
  });

  const user = await getUser(tokens.decodedToken.uid);
  const response = new NextResponse(
    JSON.stringify({
      customClaims: user.customClaims,
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );

  // Attach `Set-Cookie` headers with token containing new custom claims
  await refreshAuthCookies(tokens.token, response, authConfig);

  return response;
}
