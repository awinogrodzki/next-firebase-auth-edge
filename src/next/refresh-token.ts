import {NextRequest, NextResponse} from 'next/server';
import {
  SetAuthCookiesOptions,
  appendAuthCookies,
  verifyNextCookies
} from './cookies';

export async function refreshToken(
  request: NextRequest,
  options: SetAuthCookiesOptions
) {
  const result = await verifyNextCookies(
    request.cookies,
    request.headers,
    options
  );

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (!result) {
    return new NextResponse(JSON.stringify({idToken: null}), {
      status: 200,
      headers
    });
  }

  const response = new NextResponse(
    JSON.stringify({
      idToken: result.idToken
    }),
    {
      status: 200,
      headers
    }
  );

  await appendAuthCookies(response, result, options);

  return response;
}
