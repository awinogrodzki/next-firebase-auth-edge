import {
  FlattenedSign,
  JWTPayload,
  JWTVerifyResult,
  SignJWT,
  errors,
  jwtVerify
} from 'jose';
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

export async function createCustomSignature(tokens: CustomTokens, key: string) {
  const jws = await new FlattenedSign(
    toUint8Array(
      `${tokens.idToken}.${tokens.refreshToken}.${tokens.customToken}`
    )
  )
    .setProtectedHeader({alg: 'HS256'})
    .sign(toUint8Array(key));

  return jws.signature;
}

export async function verifyCustomSignature(
  tokens: CustomTokens,
  signature: string,
  key: string
): Promise<void> {
  if ((await createCustomSignature(tokens, key)) !== signature) {
    throw new errors.JWSSignatureVerificationFailed('');
  }
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
