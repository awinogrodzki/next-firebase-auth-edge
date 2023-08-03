import { JwtError, JwtErrorCode } from "./error";
import { useEmulator } from "../firebase";
import {
  decodeJwt,
  errors,
  importSPKI,
  importX509,
  jwtVerify,
  KeyLike,
} from "jose";
import { ALGORITHM_RS256 } from "../signature-verifier";
import { DecodedIdToken } from "../token-verifier";

interface VerifyOptions {
  currentDate?: Date;
}

const keyMap: Map<string, KeyLike> = new Map();

async function importPublicCryptoKey(publicKey: string) {
  if (publicKey.startsWith("-----BEGIN CERTIFICATE-----")) {
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
  publicKey: string,
  options: VerifyOptions = {}
) {
  const currentDate = options.currentDate ?? new Date();
  const currentTimestamp = currentDate.getTime() / 1000;
  const payload = decodeJwt(jwtString);

  if (!useEmulator()) {
    const key = await getPublicCryptoKey(publicKey);
    try {
      const { payload } = await jwtVerify(jwtString, key, { currentDate });

      return payload as DecodedIdToken;
    } catch (e) {
      // @TODO: Remove FirebaseAuthError and JWTError
      if (e instanceof errors.JWTExpired) {
        throw new JwtError(
          JwtErrorCode.TOKEN_EXPIRED,
          "token expired: " + new Date((payload?.exp ?? 0) * 1000).toISOString()
        );
      }

      throw e;
    }
  }

  if (typeof payload.nbf !== "undefined") {
    if (typeof payload.nbf !== "number") {
      throw new JwtError(JwtErrorCode.INVALID_ARGUMENT, "invalid nbf value");
    }
    if (payload.nbf > currentTimestamp) {
      throw new JwtError(
        JwtErrorCode.TOKEN_EXPIRED,
        "jwt not active: " + new Date(payload.nbf * 1000).toISOString()
      );
    }
  }

  if (typeof payload.exp !== "undefined") {
    if (typeof payload.exp !== "number") {
      throw new JwtError(JwtErrorCode.INVALID_ARGUMENT, "invalid exp value");
    }

    if (currentTimestamp >= payload.exp) {
      throw new JwtError(
        JwtErrorCode.TOKEN_EXPIRED,
        "token expired: " + new Date(payload.exp * 1000).toISOString()
      );
    }
  }

  return payload as DecodedIdToken;
}
