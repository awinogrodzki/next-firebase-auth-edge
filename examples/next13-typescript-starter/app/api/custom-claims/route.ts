import {NextRequest, NextResponse} from 'next/server';
import {authConfig} from '../../../config/server-config';
import {getTokens} from 'next-firebase-auth-edge/lib/next/tokens';
import {refreshAuthCookies} from 'next-firebase-auth-edge/lib/next/middleware';
import {getFirebaseAuth} from 'next-firebase-auth-edge/lib/auth';

const {setCustomUserClaims, getUser} = getFirebaseAuth(
  authConfig.serviceAccount,
  authConfig.apiKey
);

export async function POST(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

  if (!tokens) {
    throw new Error('Cannot update custom claims of unauthenticated user');
  }

  const appCheckToken = request.headers.get('X-Firebase-AppCheck') ?? undefined;

  await setCustomUserClaims(tokens.decodedToken.uid, {
    someCustomClaim: {
      updatedAt: Date.now()
    }
  });

  const user = await getUser(tokens.decodedToken.uid);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const response = new NextResponse(
    JSON.stringify({
      customClaims: user?.customClaims
    }),
    {
      status: 200,
      headers
    }
  );

  // Attach `Set-Cookie` headers with token containing new custom claims
  await refreshAuthCookies(tokens.token, response, {
    ...authConfig,
    appCheckToken
  });

  return response;
}
