export interface FirebaseClaims {
  identities: {
    [key: string]: unknown;
  };
  sign_in_provider: string;
  sign_in_second_factor?: string;
  second_factor_identifier?: string;
  tenant?: string;
  [key: string]: unknown;
}

export interface DecodedIdToken {
  aud: string;
  auth_time: number;
  email?: string;
  email_verified?: boolean;
  name?: string;
  exp: number;
  firebase: FirebaseClaims;
  source_sign_in_provider: string;
  iat: number;
  iss: string;
  phone_number?: string;
  picture?: string;
  sub: string;
  uid: string;
  [key: string]: unknown;
}

export interface VerifyOptions {
  currentDate?: Date;
  checkRevoked?: boolean;
  referer?: string;
  experimental_enableTokenRefreshOnExpiredKidHeader?: boolean;
}

export interface Tokens<Metadata extends object> {
  decodedToken: DecodedIdToken;
  token: string;
  // Set `enableCustomToken` to true in `authMiddleware` to enable custom token
  customToken?: string;
  // Pass `getMetadata` to `authMiddleware` to save token metadata
  metadata: Metadata;
}

export interface TokenSet {
  idToken: string;
  refreshToken: string;
  decodedIdToken: DecodedIdToken;
  customToken?: string;
}
