import {refreshNextResponseCookies} from 'next-firebase-auth-edge/lib/next/cookies';
import {getTokens} from 'next-firebase-auth-edge/lib/next/tokens';
import {NextResponse} from 'next/server';
import type { NextRequest } from 'next/server';
import {authConfig} from '../../../config/server-config';

export async function GET(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

  if (!tokens) {
    throw new Error('Cannot refresh tokens of unauthenticated user');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const response = new NextResponse(
    JSON.stringify({
      success: true
    }),
    {
      status: 200,
      headers
    }
  );

  return refreshNextResponseCookies(request, response, authConfig);
}
