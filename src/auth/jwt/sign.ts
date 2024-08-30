import { JWTPayload, KeyLike, SignJWT, base64url, importPKCS8 } from 'jose';
import { ALGORITHM_RS256 } from '../signature-verifier';
import { fetchAny } from '../utils';
import { AuthError, AuthErrorCode } from '../error';

export type SignOptions = {
  readonly payload: JWTPayload;
  readonly privateKey: string;
  readonly keyId?: string;
};

export async function sign({
  payload,
  privateKey,
  keyId
}: SignOptions): Promise<string> {
  let key: KeyLike;

  try {
    key = await importPKCS8(privateKey, ALGORITHM_RS256);
  } catch (e) {
    const error = new AuthError(AuthErrorCode.INVALID_ARGUMENT, "It looks like the value provided for `serviceAccount.privateKey` is incorrectly formatted. Please double-check if private key has correct format. See https://github.com/awinogrodzki/next-firebase-auth-edge/issues/246#issuecomment-2321559620 for details")
    error.stack = (error?.stack ?? '') + (e as Error)?.stack ?? '';
    throw error;
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM_RS256, kid: keyId })
    .sign(key);
}

export type SignBlobOptions = {
  readonly serviceAccountId: string;
  readonly accessToken: string;
  readonly payload: JWTPayload;
};

function formatBase64(value: string) {
  return value.replace(/\//g, '_').replace(/\+/g, '-').replace(/=+$/, '');
}

function encodeSegment(segment: Record<string, string> | JWTPayload): string {
  const value = JSON.stringify(segment);

  return formatBase64(base64url.encode(value));
}

export async function signBlob({
  payload,
  serviceAccountId,
  accessToken
}: SignBlobOptions): Promise<string> {
  const url = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountId}:signBlob`;
  const header = {
    alg: ALGORITHM_RS256,
    typ: 'JWT'
  };
  const token = `${encodeSegment(header)}.${encodeSegment(payload)}`;
  const request: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ payload: base64url.encode(token) })
  };
  const response = await fetchAny(url, request);
  const blob = await response.blob();
  const key = await blob.text();
  const { signedBlob } = JSON.parse(key);

  return `${token}.${formatBase64(signedBlob)}`;
}
