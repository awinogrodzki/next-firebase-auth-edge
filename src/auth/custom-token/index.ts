import {
  FlattenedSign,
  JWTPayload,
  JWTVerifyResult,
  SignJWT,
  errors,
  jwtVerify
} from 'jose';
import {DecodedIdToken} from '../types.js';
import {toUint8Array} from '../utils.js';

export interface CustomTokens {
  idToken: string;
  refreshToken: string;
  customToken: string;
}

export interface ParsedCookies<Metadata extends object> {
  idToken: string;
  refreshToken: string;
  customToken?: string;
  metadata: Metadata;
}

export interface VerifiedCookies<Metadata extends object> {
  idToken: string;
  refreshToken: string;
  customToken?: string;
  decodedIdToken: DecodedIdToken;
  metadata: Metadata;
}

export interface CustomJWTHeader {
  alg: 'HS256';
  typ: 'JWT';
}

export interface CustomJWTPayload<Metadata extends object | undefined>
  extends JWTPayload {
  id_token: string;
  refresh_token: string;
  custom_token?: string;
  metadata?: Metadata;
}

export async function createCustomSignature<Metadata extends object>(
  value: ParsedCookies<Metadata>,
  key: string
) {
  let data = `${value.idToken}.${value.refreshToken}`;

  if (value.customToken) {
    data += `.${value.customToken}`;
  }

  if (value.metadata && Object.keys(value.metadata).length > 0) {
    data += `.${JSON.stringify(value.metadata)}`;
  }

  const jws = await new FlattenedSign(toUint8Array(data))
    .setProtectedHeader({alg: 'HS256'})
    .sign(toUint8Array(key));

  return jws.signature;
}

export async function verifyCustomSignature<Metadata extends object>(
  value: ParsedCookies<Metadata>,
  signature: string,
  key: string
): Promise<void> {
  if ((await createCustomSignature(value, key)) !== signature) {
    throw new errors.JWSSignatureVerificationFailed('');
  }
}

export async function createCustomJWT<Metadata extends object>(
  payload: CustomJWTPayload<Metadata>,
  secret: string
): Promise<string> {
  const jwt = new SignJWT(payload);

  jwt.setProtectedHeader({alg: 'HS256', typ: 'JWT'});

  return jwt.sign(toUint8Array(secret));
}

export async function verifyCustomJWT<Metadata extends object>(
  customJWT: string,
  secret: string
): Promise<JWTVerifyResult<CustomJWTPayload<Metadata>>> {
  return jwtVerify(customJWT, toUint8Array(secret));
}
