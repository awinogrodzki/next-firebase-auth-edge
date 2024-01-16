import {importPKCS8, JWTPayload, SignJWT} from 'jose';
import {ALGORITHM_RS256} from '../signature-verifier';

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
  const key = await importPKCS8(privateKey, ALGORITHM_RS256);

  return new SignJWT(payload)
    .setProtectedHeader({alg: ALGORITHM_RS256, kid: keyId})
    .sign(key);
}
