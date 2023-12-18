import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "../../../config/server-config";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { refreshAuthCookies } from "next-firebase-auth-edge/lib/next/middleware";
import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";

export async function POST(request: NextRequest) {
  return new NextResponse(
    JSON.stringify({
      appCheckToken: request.headers.get("X-Firebase-AppCheck"),
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}
