import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {
  SetAuthCookiesOptions,
  appendAuthCookies,
  verifyNextCookies
} from './cookies/index.js';
import {HttpError, isInvalidTokenError} from '../auth/index.js';

export async function refreshToken<Metadata extends object>(
  request: NextRequest,
  options: SetAuthCookiesOptions<Metadata>
) {
  try {
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
        idToken: result.idToken,
        customToken: result.customToken
      }),
      {
        status: 200,
        headers
      }
    );

    await appendAuthCookies(request.headers, response, result, options);

    return response;
  } catch (error: unknown) {
    if (isInvalidTokenError(error)) {
      return new NextResponse(
        JSON.stringify({
          reason: error.reason,
          message: error.message
        } as HttpError),
        {
          status: 401
        }
      );
    }

    throw error;
  }
}
