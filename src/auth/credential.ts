import {sign} from './jwt/sign';
import {JWTPayload} from 'jose';
import fs from 'fs';
import {fetchJson, fetchText} from './utils';

export interface GoogleOAuthAccessToken {
  access_token: string;
  expires_in: number;
}

export interface Credential {
  getProjectId(): Promise<string>;
  getServiceAccountEmail(): Promise<string | null>;
  getAccessToken(forceRefresh?: boolean): Promise<FirebaseAccessToken>;
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

export interface RefreshToken {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  type: string;
}

export interface ImpersonatedServiceAccount {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  type: string;
}

const accessTokenCache: Map<string, FirebaseAccessToken> = new Map();

function serviceAccountFromPath(filePath: string): ServiceAccount {
  try {
    const {
      project_id: projectId,
      private_key: privateKey,
      client_email: clientEmail
    } = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    return {projectId, privateKey, clientEmail};
  } catch (error) {
    // Throw a nicely formed error message if the file contents cannot be parsed
    throw new Error('Failed to parse service account json file: ' + error);
  }
}

function refreshTokenFromPath(filePath: string): RefreshToken {
  try {
    const {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      type
    } = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    return {
      clientId,
      clientSecret,
      refreshToken,
      type
    };
  } catch (error) {
    // Throw a nicely formed error message if the file contents cannot be parsed
    throw new Error('Failed to parse refresh token file: ' + error);
  }
}

function impersonatedServiceAccountFromPath(
  filePath: string
): ImpersonatedServiceAccount {
  try {
    const {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      type
    } = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    return {
      clientId,
      clientSecret,
      refreshToken,
      type
    };
  } catch (error) {
    throw new Error(
      'Failed to parse impersonated service account file: ' + error
    );
  }
}

export class ServiceAccountCredential implements Credential {
  public readonly projectId: string;
  public readonly privateKey: string;
  public readonly clientEmail: string;

  constructor(serviceAccountPathOrObject: ServiceAccount | string) {
    const serviceAccount =
      typeof serviceAccountPathOrObject === 'string'
        ? serviceAccountFromPath(serviceAccountPathOrObject)
        : serviceAccountPathOrObject;
    this.projectId = serviceAccount.projectId;
    this.privateKey = serviceAccount.privateKey;
    this.clientEmail = serviceAccount.clientEmail;
  }

  private async fetchAccessToken(url: string): Promise<FirebaseAccessToken> {
    const token = await this.createJwt();
    const postData =
      'grant_type=urn%3Aietf%3Aparams%3Aoauth%3A' +
      'grant-type%3Ajwt-bearer&assertion=' +
      token;

    return requestAccessToken(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      },
      body: postData
    });
  }

  public getProjectId(): Promise<string> {
    return Promise.resolve(this.projectId);
  }

  public getServiceAccountEmail(): Promise<string> {
    return Promise.resolve(this.clientEmail);
  }

  private async fetchAndCacheAccessToken(url: string) {
    const response = await this.fetchAccessToken(url);
    accessTokenCache.set(url.toString(), response);
    return response;
  }
  public async getAccessToken(
    forceRefresh: boolean
  ): Promise<FirebaseAccessToken> {
    const url = `https://${GOOGLE_AUTH_TOKEN_HOST}${GOOGLE_AUTH_TOKEN_PATH}`;

    if (forceRefresh) {
      return this.fetchAndCacheAccessToken(url);
    }

    const cachedResponse = accessTokenCache.get(url);

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

async function requestAccessToken(
  urlString: string,
  init: RequestInit
): Promise<FirebaseAccessToken> {
  const json = await fetchJson(urlString, init);

  if (!json.access_token || !json.expires_in) {
    throw new Error(
      `Unexpected response while fetching access token: ${JSON.stringify(json)}`
    );
  }

  return {
    accessToken: json.access_token,
    expirationTime: Date.now() + json.expires_in * 1000
  };
}

const REFRESH_TOKEN_HOST = 'www.googleapis.com';
const REFRESH_TOKEN_PATH = '/oauth2/v4/token';

export function getExplicitProjectId(): string | null {
  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  if (projectId) {
    return projectId;
  }
  return null;
}

export class RefreshTokenCredential implements Credential {
  private readonly refreshToken: RefreshToken;
  private cachedToken?: FirebaseAccessToken;

  constructor(refreshTokenPathOrObject: string | RefreshToken) {
    this.refreshToken =
      typeof refreshTokenPathOrObject === 'string'
        ? refreshTokenFromPath(refreshTokenPathOrObject)
        : refreshTokenPathOrObject;
  }

  getProjectId(): Promise<string> {
    const projectIdFromEnv = getExplicitProjectId();

    if (!projectIdFromEnv) {
      throw new Error(
        'In order to use RefreshTokenCredential you need to have GOOGLE_CLOUD_PROJECT or GCLOUD_PROJECT environment variable defined'
      );
    }

    return Promise.resolve(projectIdFromEnv);
  }

  getServiceAccountEmail(): Promise<string | null> {
    return Promise.resolve(null);
  }

  public async getAccessToken(
    forceRefresh: boolean = false
  ): Promise<FirebaseAccessToken> {
    if (
      this.cachedToken &&
      !forceRefresh &&
      this.cachedToken.expirationTime - Date.now() <=
        TOKEN_EXPIRY_THRESHOLD_MILLIS
    ) {
      return this.cachedToken;
    }

    const postData =
      'client_id=' +
      this.refreshToken.clientId +
      '&' +
      'client_secret=' +
      this.refreshToken.clientSecret +
      '&' +
      'refresh_token=' +
      this.refreshToken.refreshToken +
      '&' +
      'grant_type=refresh_token';
    const request: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      },
      body: postData
    };

    return (this.cachedToken = await requestAccessToken(
      `https://${REFRESH_TOKEN_HOST}${REFRESH_TOKEN_PATH}`,
      request
    ));
  }
}

export class ImpersonatedServiceAccountCredential implements Credential {
  private readonly impersonatedServiceAccount: ImpersonatedServiceAccount;
  private cachedToken?: FirebaseAccessToken;

  constructor(
    impersonatedServiceAccountPathOrObject: string | ImpersonatedServiceAccount
  ) {
    this.impersonatedServiceAccount =
      typeof impersonatedServiceAccountPathOrObject === 'string'
        ? impersonatedServiceAccountFromPath(
            impersonatedServiceAccountPathOrObject
          )
        : impersonatedServiceAccountPathOrObject;
  }

  getProjectId(): Promise<string> {
    const projectIdFromEnv = getExplicitProjectId();

    if (!projectIdFromEnv) {
      throw new Error(
        'In order to use ImpersonatedServiceAccountCredential you need to have GOOGLE_CLOUD_PROJECT or GCLOUD_PROJECT environment variable defined'
      );
    }

    return Promise.resolve(projectIdFromEnv);
  }

  getServiceAccountEmail(): Promise<string | null> {
    return Promise.resolve(null);
  }

  public async getAccessToken(
    forceRefresh: boolean = false
  ): Promise<FirebaseAccessToken> {
    if (
      this.cachedToken &&
      !forceRefresh &&
      this.cachedToken.expirationTime - Date.now() <=
        TOKEN_EXPIRY_THRESHOLD_MILLIS
    ) {
      return this.cachedToken;
    }

    const postData =
      'client_id=' +
      this.impersonatedServiceAccount.clientId +
      '&' +
      'client_secret=' +
      this.impersonatedServiceAccount.clientSecret +
      '&' +
      'refresh_token=' +
      this.impersonatedServiceAccount.refreshToken +
      '&' +
      'grant_type=refresh_token';
    const request: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      },
      body: postData
    };

    return (this.cachedToken = await requestAccessToken(
      `https://${REFRESH_TOKEN_HOST}${REFRESH_TOKEN_PATH}`,
      request
    ));
  }
}

const GOOGLE_METADATA_SERVICE_HOST = 'metadata.google.internal';
const GOOGLE_METADATA_SERVICE_TOKEN_PATH =
  '/computeMetadata/v1/instance/service-accounts/default/token';
const GOOGLE_METADATA_SERVICE_IDENTITY_PATH =
  '/computeMetadata/v1/instance/service-accounts/default/identity';
const GOOGLE_METADATA_SERVICE_PROJECT_ID_PATH =
  '/computeMetadata/v1/project/project-id';
const GOOGLE_METADATA_SERVICE_ACCOUNT_ID_PATH =
  '/computeMetadata/v1/instance/service-accounts/default/email';

async function requestIDToken(
  url: string,
  request: RequestInit
): Promise<string> {
  const text = await fetchText(url, request);

  if (!text) {
    throw new Error(
      'Unexpected response while fetching id token: response.text is undefined'
    );
  }

  return text;
}

export class ComputeEngineCredential implements Credential {
  private projectId?: string;
  private accountId?: string;
  private cachedToken?: FirebaseAccessToken;

  constructor() {}

  public async getAccessToken(
    forceRefresh: boolean = false
  ): Promise<FirebaseAccessToken> {
    const url = `http://${GOOGLE_METADATA_SERVICE_HOST}${GOOGLE_METADATA_SERVICE_TOKEN_PATH}`;
    const request = this.buildRequest();

    if (
      this.cachedToken &&
      !forceRefresh &&
      this.cachedToken.expirationTime - Date.now() <=
        TOKEN_EXPIRY_THRESHOLD_MILLIS
    ) {
      return this.cachedToken;
    }

    return (this.cachedToken = await requestAccessToken(url, request));
  }

  public getIDToken(audience: string): Promise<string> {
    const url = `http://${GOOGLE_METADATA_SERVICE_HOST}${GOOGLE_METADATA_SERVICE_IDENTITY_PATH}?audience=${audience}`;

    const request = this.buildRequest();
    return requestIDToken(url, request);
  }

  public async getProjectId(): Promise<string> {
    if (this.projectId) {
      return Promise.resolve(this.projectId);
    }

    const url = `http://${GOOGLE_METADATA_SERVICE_HOST}${GOOGLE_METADATA_SERVICE_PROJECT_ID_PATH}`;
    const request = this.buildRequest();

    try {
      const text = await fetchText(url, request);
      this.projectId = text;
      return this.projectId;
    } catch (err) {
      throw new Error(`Failed to determine project ID: ${err}`);
    }
  }

  public async getServiceAccountEmail(): Promise<string> {
    if (this.accountId) {
      return Promise.resolve(this.accountId);
    }

    const url = `http://${GOOGLE_METADATA_SERVICE_HOST}${GOOGLE_METADATA_SERVICE_ACCOUNT_ID_PATH}`;
    const request = this.buildRequest();

    try {
      const text = await fetchText(url, request);
      this.accountId = text;
      return this.accountId;
    } catch (err) {
      throw new Error(`Failed to determine service account email: ${err}`);
    }
  }

  private buildRequest(): RequestInit {
    return {
      method: 'GET',
      headers: {
        'Metadata-Flavor': 'Google'
      }
    };
  }
}

export interface FirebaseAccessToken {
  accessToken: string;
  expirationTime: number;
}

export const getFirebaseAdminTokenProvider = (credential: Credential) => {
  async function getToken(forceRefresh = false): Promise<FirebaseAccessToken> {
    return credential.getAccessToken(forceRefresh);
  }

  return {
    getToken
  };
};
