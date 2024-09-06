import {decodeJwt} from 'jose';
import {AuthError, AuthErrorCode} from '../auth/error';

class ClientTokenCache {
  private cacheMap: Record<string, string> = {};

  constructor() {}

  public get(value: string) {
    if (!this.cacheMap[value]) {
      return value;
    }

    return this.cacheMap[value];
  }

  public set(originalValue: string, value: string) {
    this.cacheMap = {[originalValue]: value};
  }
}

const idTokenCache = new ClientTokenCache();
const customTokenCache = new ClientTokenCache();

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
  // If serverIdToken is empty, we assume user is unauthenticated and token refresh will yield null
  if (!serverIdToken) {
    return null;
  }

  const token = idTokenCache.get(serverIdToken);
  const payload = decodeJwt(token);
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

  idTokenCache.set(serverIdToken, response.idToken);

  return response.idToken;
}

export interface GetValidCustomTokenOptions {
  serverCustomToken: string;
  refreshTokenUrl: string;
  checkRevoked?: boolean;
}

export async function getValidCustomToken({
  serverCustomToken,
  refreshTokenUrl,
  checkRevoked
}: GetValidCustomTokenOptions): Promise<string | null> {
  // If serverCustomToken is empty, we assume user is unauthenticated and token refresh will yield null
  if (!serverCustomToken) {
    return null;
  }

  const token = customTokenCache.get(serverCustomToken);
  const payload = decodeJwt(token);
  const exp = payload?.exp ?? 0;

  if (!checkRevoked && exp > Date.now() / 1000) {
    return serverCustomToken;
  }

  const response = await fetchApi<{customToken: string}>(refreshTokenUrl);

  if (!response?.customToken) {
    throw new AuthError(
      AuthErrorCode.INTERNAL_ERROR,
      'Refresh token endpoint returned invalid response. This URL should point to endpoint exposed by the middleware and configured using refreshTokenPath option'
    );
  }

  customTokenCache.set(serverCustomToken, response.customToken);

  return response.customToken;
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

function safeResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return response.json();
  } else {
    return response.text() as Promise<T>;
  }
}

async function fetchApi<T>(
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
