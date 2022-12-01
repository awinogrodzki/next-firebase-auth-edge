import { isNonNullObject } from './validator';
import { sign } from './jwt';
import { DecodedJWTPayload } from './jwt/types';

export interface GoogleOAuthAccessToken {
  access_token: string;
  expires_in: number;
}

export interface Credential {
  getAccessToken(): Promise<GoogleOAuthAccessToken>;
}

const TOKEN_EXPIRY_THRESHOLD_MILLIS = 5 * 60 * 1000;
const GOOGLE_TOKEN_AUDIENCE = 'https://accounts.google.com/o/oauth2/token';
const GOOGLE_AUTH_TOKEN_HOST = 'accounts.google.com';
const GOOGLE_AUTH_TOKEN_PATH = '/o/oauth2/token';
const ONE_HOUR_IN_SECONDS = 60 * 60;
const JWT_ALGORITHM = 'RS256';

export interface ServiceAccount {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

export class ServiceAccountCredential implements Credential {
  public readonly projectId: string;
  public readonly privateKey: string;
  public readonly clientEmail: string;

  constructor(serviceAccount: ServiceAccount) {

    this.projectId = serviceAccount.projectId;
    this.privateKey = serviceAccount.privateKey;
    this.clientEmail = serviceAccount.clientEmail;
  }

  public async getAccessToken(): Promise<GoogleOAuthAccessToken> {
    const token = await this.createJwt();
    const postData = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3A' +
      'grant-type%3Ajwt-bearer&assertion=' + token;

    const res = await fetch(`https://${GOOGLE_AUTH_TOKEN_HOST}${GOOGLE_AUTH_TOKEN_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      },
      body: postData,
    });

    return requestAccessToken(res);
  }

  private async createJwt(): Promise<string> {
    const iat = Math.floor(Date.now() / 1000);

    const payload = {
      aud: GOOGLE_TOKEN_AUDIENCE,
      iat,
      exp: iat + ONE_HOUR_IN_SECONDS,
      iss: this.clientEmail,
      sub: this.clientEmail,
      scope: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/firebase.database',
        'https://www.googleapis.com/auth/firebase.messaging',
        'https://www.googleapis.com/auth/identitytoolkit',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    } as DecodedJWTPayload;

    return sign({
      payload,
      privateKey: this.privateKey,
      algorithm: JWT_ALGORITHM,
    });
  }
}

async function requestAccessToken(res: Response): Promise<GoogleOAuthAccessToken> {
  if (!res.ok) {
    const data = await res.json();
    throw new Error(getErrorMessage(data));
  }
  const data = await res.json();

  if (!data.access_token || !data.expires_in) {
    throw new Error(
      `Unexpected response while fetching access token: ${JSON.stringify(data)}`,
    );
  }

  return data;
}

function getErrorMessage(data: any): string {
  const detail: string = getDetailFromResponse(data);
  return `Error fetching access token: ${detail}`;
}

function getDetailFromResponse(data: any): string {
  if (data?.error) {
    const json = data;
    let detail = json.error;
    if (json.error_description) {
      detail += ' (' + json.error_description + ')';
    }
    return detail;
  }
  return 'Missing error payload';
}


export interface FirebaseAccessToken {
  accessToken: string;
  expirationTime: number;
}

export const getFirebaseAdminTokenProvider = (account: ServiceAccount) => {
  const credential = new ServiceAccountCredential(account);

  let cachedToken: FirebaseAccessToken | undefined;

  function shouldRefresh(): boolean {
    return !cachedToken || (cachedToken.expirationTime - Date.now()) <= TOKEN_EXPIRY_THRESHOLD_MILLIS;
  }

  async function getToken(forceRefresh = false): Promise<FirebaseAccessToken> {
    if (forceRefresh || shouldRefresh()) {
      return refreshToken();
    }

    return Promise.resolve(cachedToken!);
  }


  async function refreshToken(): Promise<FirebaseAccessToken> {
    const result = await credential.getAccessToken();

    if (!isNonNullObject(result)) {
      throw new Error(
        `Invalid access token generated: "${JSON.stringify(result)}". Valid access ` +
        'tokens must be an object with the "expires_in" (number) and "access_token" ' +
        '(string) properties.',
      );
    }

    const token = {
      accessToken: result.access_token,
      expirationTime: Date.now() + (result.expires_in * 1000),
    };
    if (!cachedToken
      || cachedToken.accessToken !== token.accessToken
      || cachedToken.expirationTime !== token.expirationTime) {
      cachedToken = token;
    }

    return token;
  }

  return {
    getToken,
  };
};
