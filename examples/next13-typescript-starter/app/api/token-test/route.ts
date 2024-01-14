import { NextRequest, NextResponse } from "next/server";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { authConfig } from "../../../config/server-config";

export async function GET(_request: NextRequest) {
  const tokens = await getTokens(cookies(), authConfig);

  if (!tokens) {
    throw new Error("Unauthenticated");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = new NextResponse(
    JSON.stringify({
      tokens,
    }),
    {
      status: 200,
      headers,
    }
  );

  return response;
}
