import {getSdkVersion} from '../auth/auth-request-handler';
import {Credential} from '../auth/credential';
import {formatString} from '../auth/utils';
import {AppCheckToken} from './types';

const FIREBASE_APP_CHECK_V1_API_URL_FORMAT =
  'https://firebaseappcheck.googleapis.com/v1/projects/{projectId}/apps/{appId}:exchangeCustomToken';

const FIREBASE_APP_CHECK_CONFIG_HEADERS = {
  'X-Firebase-Client': `fire-admin-node/${getSdkVersion()}`
};

export class AppCheckApiClient {
  constructor(private credential: Credential) {}

  public async exchangeToken(
    customToken: string,
    appId: string
  ): Promise<AppCheckToken> {
    const url = await this.getUrl(appId);
    const token = await this.credential.getAccessToken(false);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...FIREBASE_APP_CHECK_CONFIG_HEADERS,
        Authorization: `Bearer ${token.accessToken}`
      },
      body: JSON.stringify({customToken})
    });

    if (response.ok) {
      return this.toAppCheckToken(response);
    }

    throw await this.toFirebaseError(response);
  }

  private async getUrl(appId: string): Promise<string> {
    const projectId = await this.credential.getProjectId();
    const urlParams = {
      projectId,
      appId
    };
    const baseUrl = formatString(
      FIREBASE_APP_CHECK_V1_API_URL_FORMAT,
      urlParams
    );

    return formatString(baseUrl);
  }

  private async toFirebaseError(
    response: Response
  ): Promise<FirebaseAppCheckError> {
    const data = (await response.json()) as ErrorResponse;
    const error: Error = data.error || {};
    let code: AppCheckErrorCode = 'unknown-error';
    if (error.status && error.status in APP_CHECK_ERROR_CODE_MAPPING) {
      code = APP_CHECK_ERROR_CODE_MAPPING[error.status];
    }
    const message = error.message || `Unknown server error: ${response.text}`;
    return new FirebaseAppCheckError(code, message);
  }

  private async toAppCheckToken(response: Response): Promise<AppCheckToken> {
    const data = await response.json();
    const token = data.token;
    const ttlMillis = this.stringToMilliseconds(data.ttl);

    return {
      token,
      ttlMillis
    };
  }

  private stringToMilliseconds(duration: string): number {
    if (!duration.endsWith('s')) {
      throw new FirebaseAppCheckError(
        'invalid-argument',
        '`ttl` must be a valid duration string with the suffix `s`.'
      );
    }
    const seconds = duration.slice(0, -1);
    return Math.floor(Number(seconds) * 1000);
  }
}

export interface ErrorResponse {
  error?: Error;
}

export interface Error {
  code?: number;
  message?: string;
  status?: string;
}

export const APP_CHECK_ERROR_CODE_MAPPING: {
  [key: string]: AppCheckErrorCode;
} = {
  ABORTED: 'aborted',
  INVALID_ARGUMENT: 'invalid-argument',
  INVALID_CREDENTIAL: 'invalid-credential',
  INTERNAL: 'internal-error',
  PERMISSION_DENIED: 'permission-denied',
  UNAUTHENTICATED: 'unauthenticated',
  NOT_FOUND: 'not-found',
  UNKNOWN: 'unknown-error'
};

export type AppCheckErrorCode =
  | 'aborted'
  | 'invalid-argument'
  | 'invalid-credential'
  | 'internal-error'
  | 'permission-denied'
  | 'unauthenticated'
  | 'not-found'
  | 'app-check-token-expired'
  | 'unknown-error';

export class FirebaseAppCheckError extends Error {
  constructor(
    public readonly code: AppCheckErrorCode,
    message: string
  ) {
    super(`(${code}): ${message}`);
    Object.setPrototypeOf(this, FirebaseAppCheckError.prototype);
  }
}
