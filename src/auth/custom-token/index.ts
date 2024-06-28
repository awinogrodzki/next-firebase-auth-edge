import {JWTPayload, JWTVerifyResult, SignJWT, jwtVerify} from 'jose';
import {toUint8Array} from '../utils';
import {DecodedIdToken} from '../token-verifier';

export interface CustomTokens {
  idToken: string;
  refreshToken: string;
  customToken: string;
}

export interface VerifiedTokens {
  idToken: string;
  refreshToken: string;
  customToken: string;
  decodedIdToken: DecodedIdToken;
}

export interface CustomJWTHeader {
  alg: 'HS256';
  typ: 'JWT';
}

export interface CustomJWTPayload extends JWTPayload {
  id_token: string;
  refresh_token: string;
  custom_token: string;
}

export async function createCustomJWT(
  payload: CustomJWTPayload,
  secret: string
): Promise<string> {
  const jwt = new SignJWT(payload);

  jwt.setProtectedHeader({alg: 'HS256', typ: 'JWT'});

  return jwt.sign(toUint8Array(secret));
}

export async function verifyCustomJWT(
  customJWT: string,
  secret: string
): Promise<JWTVerifyResult<CustomJWTPayload>> {
  return jwtVerify(customJWT, toUint8Array(secret));
}
