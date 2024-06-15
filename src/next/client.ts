import {decodeJwt} from 'jose';
import {AuthError, AuthErrorCode} from '../auth/error';

export interface GetValidIdTokenOptions {
  serverIdToken: string;
  refreshTokenUrl: string;
  checkRevoked?: boolean;
}

export async function getValidIdToken({
  serverIdToken,
  refreshTokenUrl,
  checkRevoked
}: GetValidIdTokenOptions): Promise<string | null> {
  const payload = decodeJwt(serverIdToken);
  const exp = payload?.exp ?? 0;

  if (!checkRevoked && exp > Date.now() / 1000) {
    return serverIdToken;
  }

  const response = await fetchApi<{idToken: string}>(refreshTokenUrl);

  if (!response?.idToken) {
    throw new AuthError(
      AuthErrorCode.INTERNAL_ERROR,
      'Refresh token endpoint returned invalid response. This URL should point to endpoint exposed by the middleware and configured using refreshTokenPath option'
    );
  }

  return response.idToken;
}

async function mapResponseToAuthError(
  response: Response,
  input: RequestInfo | URL,
  init?: RequestInit
) {
  const text = await safeResponse(response);

  return new AuthError(
    AuthErrorCode.INTERNAL_ERROR,
    `next-firebase-auth-edge: Internal request to ${
      init?.method ?? 'GET'
    } ${input.toString()} has failed: ${text}`
  );
}

function safeResponse<T extends any>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return response.json();
  } else {
    return response.text() as Promise<T>;
  }
}

async function fetchApi<T extends any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw await mapResponseToAuthError(response, input, init);
  }

  return safeResponse(response);
}
