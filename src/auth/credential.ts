import { sign } from "./jwt";
import { DecodedJWTPayload } from "./jwt/types";
import { getResponseCache, ResponseCache } from "./response-cache";

export interface GoogleOAuthAccessToken {
  access_token: string;
  expires_in: number;
}

export interface Credential {
  getAccessToken(forceRefresh: boolean): Promise<FirebaseAccessToken>;
}

const TOKEN_EXPIRY_THRESHOLD_MILLIS = 5 * 60 * 1000;
const GOOGLE_TOKEN_AUDIENCE = "https://accounts.google.com/o/oauth2/token";
const GOOGLE_AUTH_TOKEN_HOST = "accounts.google.com";
const GOOGLE_AUTH_TOKEN_PATH = "/o/oauth2/token";
const ONE_HOUR_IN_SECONDS = 60 * 60;
const JWT_ALGORITHM = "RS256";

export interface ServiceAccount {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

export class ServiceAccountCredential implements Credential {
  public readonly projectId: string;
  public readonly privateKey: string;
  public readonly clientEmail: string;
  private readonly cache: ResponseCache;

  constructor(serviceAccount: ServiceAccount) {
    this.projectId = serviceAccount.projectId;
    this.privateKey = serviceAccount.privateKey;
    this.clientEmail = serviceAccount.clientEmail;
    this.cache = getResponseCache();
  }

  private async fetchAccessToken(url: URL) {
    const token = await this.createJwt();
    const postData =
      "grant_type=urn%3Aietf%3Aparams%3Aoauth%3A" +
      "grant-type%3Ajwt-bearer&assertion=" +
      token;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: postData,
    });

    const clone = response.clone();
    const data: GoogleOAuthAccessToken = await response.json();

    if (!data.access_token || !data.expires_in) {
      throw new Error(
        `Unexpected response while fetching access token: ${JSON.stringify(
          data
        )}`
      );
    }

    const body = JSON.stringify({
      accessToken: data.access_token,
      expirationTime: Date.now() + data.expires_in * 1000,
    } as FirebaseAccessToken);

    return new Response(body, clone);
  }

  private async fetchAndCacheAccessToken(url: URL) {
    const response = await this.fetchAccessToken(url);
    await this.cache.put(url, response.clone());
    return response;
  }
  public async getAccessToken(
    forceRefresh: boolean
  ): Promise<FirebaseAccessToken> {
    const url = new URL(
      `https://${GOOGLE_AUTH_TOKEN_HOST}${GOOGLE_AUTH_TOKEN_PATH}`
    );

    if (forceRefresh) {
      return requestAccessToken(await this.fetchAndCacheAccessToken(url));
    }

    const cachedResponse = await this.cache.get(url);

    if (!cachedResponse) {
      return requestAccessToken(await this.fetchAndCacheAccessToken(url));
    }

    const response = await requestAccessToken(cachedResponse);

    if (response.expirationTime - Date.now() <= TOKEN_EXPIRY_THRESHOLD_MILLIS) {
      return requestAccessToken(await this.fetchAndCacheAccessToken(url));
    }

    return response;
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
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/firebase.database",
        "https://www.googleapis.com/auth/firebase.messaging",
        "https://www.googleapis.com/auth/identitytoolkit",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    } as DecodedJWTPayload;

    return sign({
      payload,
      privateKey: this.privateKey,
      algorithm: JWT_ALGORITHM,
    });
  }
}

async function requestAccessToken(res: Response): Promise<FirebaseAccessToken> {
  if (!res.ok) {
    const data = await res.json();
    throw new Error(getErrorMessage(data));
  }
  const data: FirebaseAccessToken = await res.json();

  if (!data.accessToken || !data.expirationTime) {
    throw new Error(
      `Unexpected response while fetching access token: ${JSON.stringify(data)}`
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
      detail += " (" + json.error_description + ")";
    }
    return detail;
  }
  return "Missing error payload";
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
    getToken,
  };
};
