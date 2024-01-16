import {useEmulator} from '../firebase';
import {
  decodeJwt,
  errors,
  importSPKI,
  importX509,
  jwtVerify,
  KeyLike
} from 'jose';
import {ALGORITHM_RS256} from '../signature-verifier';
import {DecodedIdToken} from '../token-verifier';

export interface VerifyOptions {
  currentDate?: Date;
}

const keyMap: Map<string, KeyLike> = new Map();

async function importPublicCryptoKey(publicKey: string) {
  if (publicKey.startsWith('-----BEGIN CERTIFICATE-----')) {
    return importX509(publicKey, ALGORITHM_RS256);
  }

  return importSPKI(publicKey, ALGORITHM_RS256);
}

export async function getPublicCryptoKey(publicKey: string): Promise<KeyLike> {
  const cachedKey = keyMap.get(publicKey);

  if (cachedKey) {
    return cachedKey;
  }

  const key = await importPublicCryptoKey(publicKey);
  keyMap.set(publicKey, key);
  return key;
}

export async function verify(
  jwtString: string,
  getPublicKey: () => Promise<KeyLike>,
  options: VerifyOptions = {}
) {
  const currentDate = options.currentDate ?? new Date();
  const currentTimestamp = currentDate.getTime() / 1000;
  const payload = decodeJwt(jwtString);

  if (!useEmulator()) {
    const {payload} = await jwtVerify(jwtString, await getPublicKey(), {
      currentDate
    });

    return payload as DecodedIdToken;
  }

  if (typeof payload.nbf !== 'undefined') {
    if (typeof payload.nbf !== 'number') {
      throw new errors.JWTInvalid('invalid nbf value');
    }
    if (payload.nbf > currentTimestamp) {
      throw new errors.JWTExpired(
        'jwt not active: ' + new Date(payload.nbf * 1000).toISOString()
      );
    }
  }

  if (typeof payload.exp !== 'undefined') {
    if (typeof payload.exp !== 'number') {
      throw new errors.JWTInvalid('invalid exp value');
    }

    if (currentTimestamp >= payload.exp) {
      throw new errors.JWTExpired(
        'token expired: ' + new Date(payload.exp * 1000).toISOString()
      );
    }
  }

  return payload as DecodedIdToken;
}
