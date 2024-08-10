export interface AppCheckToken {
  token: string;
  ttlMillis: number;
}

export interface AppCheckTokenOptions {
  ttlMillis?: number;
}

export interface DecodedAppCheckToken {
  iss: string;
  sub: string;
  aud: string[];
  exp: number;
  iat: number;
  app_id: string;
  [key: string]: unknown;
}

export interface VerifyAppCheckTokenResponse {
  appId: string;
  token: DecodedAppCheckToken;
}
