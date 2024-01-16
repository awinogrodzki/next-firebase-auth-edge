import {sign} from './jwt/sign';
import {JWTPayload} from 'jose';

export interface GoogleOAuthAccessToken {
  access_token: string;
  expires_in: number;
}

export interface Credential {
  getAccessToken(forceRefresh: boolean): Promise<FirebaseAccessToken>;
}

const TOKEN_EXPIRY_THRESHOLD_MILLIS = 5 * 60 * 1000;
const GOOGLE_TOKEN_AUDIENCE = 'https://accounts.google.com/o/oauth2/token';
const GOOGLE_AUTH_TOKEN_HOST = 'accounts.google.com';
const GOOGLE_AUTH_TOKEN_PATH = '/o/oauth2/token';
const ONE_HOUR_IN_SECONDS = 60 * 60;

export interface ServiceAccount {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

const accessTokenCache: Map<string, FirebaseAccessToken> = new Map();

export class ServiceAccountCredential implements Credential {
  public readonly projectId: string;
  public readonly privateKey: string;
  public readonly clientEmail: string;

  constructor(serviceAccount: ServiceAccount) {
    this.projectId = serviceAccount.projectId;
    this.privateKey = serviceAccount.privateKey;
    this.clientEmail = serviceAccount.clientEmail;
  }

  private async fetchAccessToken(url: URL): Promise<FirebaseAccessToken> {
    const token = await this.createJwt();
    const postData =
      'grant_type=urn%3Aietf%3Aparams%3Aoauth%3A' +
      'grant-type%3Ajwt-bearer&assertion=' +
      token;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      },
      body: postData
    });

    const data: GoogleOAuthAccessToken = await response.json();

    if (!data.access_token || !data.expires_in) {
      throw new Error(
        `Unexpected response while fetching access token: ${JSON.stringify(
          data
        )}`
      );
    }

    return {
      accessToken: data.access_token,
      expirationTime: Date.now() + data.expires_in * 1000
    };
  }

  private async fetchAndCacheAccessToken(url: URL) {
    const response = await this.fetchAccessToken(url);
    accessTokenCache.set(url.toString(), response);
    return response;
  }
  public async getAccessToken(
    forceRefresh: boolean
  ): Promise<FirebaseAccessToken> {
    const url = new URL(
      `https://${GOOGLE_AUTH_TOKEN_HOST}${GOOGLE_AUTH_TOKEN_PATH}`
    );

    if (forceRefresh) {
      return this.fetchAndCacheAccessToken(url);
    }

    const cachedResponse = accessTokenCache.get(url.toString());

    if (
      !cachedResponse ||
      cachedResponse.expirationTime - Date.now() <=
        TOKEN_EXPIRY_THRESHOLD_MILLIS
    ) {
      return this.fetchAndCacheAccessToken(url);
    }

    return cachedResponse;
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
        'https://www.googleapis.com/auth/userinfo.email'
      ].join(' ')
    } as JWTPayload;

    return sign({
      payload,
      privateKey: this.privateKey
    });
  }
}

export interface FirebaseAccessToken {
  accessToken: string;
  expirationTime: number;
}

export const getFirebaseAdminTokenProvider = (account: ServiceAccount) => {
  const credential = new ServiceAccountCredential(account);

  async function getToken(forceRefresh = false): Promise<FirebaseAccessToken> {
    return credential.getAccessToken(forceRefresh);
  }

  return {
    getToken
  };
};
