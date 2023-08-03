import { isNonNullObject, isString, isURL } from "./validator";
import { JwtError, JwtErrorCode } from "./jwt/error";
import { verify } from "./jwt/verify";
import {
  decodeProtectedHeader,
  JWTPayload,
  ProtectedHeaderParameters,
} from "jose";

export const ALGORITHM_RS256 = "RS256" as const;
const NO_MATCHING_KID_ERROR_MESSAGE = "no-matching-kid-error";
const NO_KID_IN_HEADER_ERROR_MESSAGE = "no-kid-in-header-error";

type PublicKeys = { [key: string]: string };

interface PublicKeysResponse {
  keys: PublicKeys;
  expiresAt: number;
}

export type DecodedToken = {
  header: ProtectedHeaderParameters;
  payload: JWTPayload;
};

export interface SignatureVerifier {
  verify(token: string): Promise<void>;
}

interface KeyFetcher {
  fetchPublicKeys(): Promise<PublicKeys>;
}

function getExpiresAt(res: Response) {
  if (!res.headers.has("cache-control")) {
    return 0;
  }

  const cacheControlHeader: string = res.headers.get("cache-control")!;
  const parts = cacheControlHeader.split(",");
  const maxAge = parts.reduce((acc, part) => {
    const subParts = part.trim().split("=");
    if (subParts[0] === "max-age") {
      return +subParts[1];
    }

    return acc;
  }, 0);

  return Date.now() + maxAge * 1000;
}

const keyResponseCache: Map<string, PublicKeysResponse> = new Map();

export class UrlKeyFetcher implements KeyFetcher {
  constructor(private clientCertUrl: string) {
    if (!isURL(clientCertUrl)) {
      throw new Error(
        "The provided public client certificate URL is not a valid URL."
      );
    }
  }

  private async fetchPublicKeysResponse(url: URL): Promise<PublicKeysResponse> {
    const res = await fetch(url);

    if (!res.ok) {
      let errorMessage = "Error fetching public keys for Google certs: ";
      const data = await res.json();
      if (data.error) {
        errorMessage += `${data.error}`;
        if (data.error_description) {
          errorMessage += " (" + data.error_description + ")";
        }
      } else {
        errorMessage += `${await res.text()}`;
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();

    if (data.error) {
      throw new JwtError(JwtErrorCode.KEY_FETCH_ERROR, data.error);
    }

    return {
      keys: data,
      expiresAt: getExpiresAt(res),
    };
  }

  private async fetchAndCachePublicKeys(url: URL): Promise<PublicKeys> {
    const response = await this.fetchPublicKeysResponse(url);
    keyResponseCache.set(url.toString(), response);

    return response.keys;
  }

  public async fetchPublicKeys(): Promise<PublicKeys> {
    const url = new URL(this.clientCertUrl);
    const cachedResponse = keyResponseCache.get(url.toString());

    if (!cachedResponse) {
      return this.fetchAndCachePublicKeys(url);
    }

    const { keys, expiresAt } = cachedResponse;

    if (expiresAt <= Date.now()) {
      return this.fetchAndCachePublicKeys(url);
    }

    return keys;
  }
}

export class PublicKeySignatureVerifier implements SignatureVerifier {
  constructor(private keyFetcher: KeyFetcher) {
    if (!isNonNullObject(keyFetcher)) {
      throw new Error("The provided key fetcher is not an object or null.");
    }
  }

  public static withCertificateUrl(
    clientCertUrl: string
  ): PublicKeySignatureVerifier {
    return new PublicKeySignatureVerifier(new UrlKeyFetcher(clientCertUrl));
  }

  public async verify(token: string): Promise<void> {
    if (!isString(token)) {
      return Promise.reject(
        new JwtError(
          JwtErrorCode.INVALID_ARGUMENT,
          "The provided token must be a string."
        )
      );
    }

    const header = decodeProtectedHeader(token);
    const publicKey = await fetchPublicKey(this.keyFetcher, header);

    await verify(token, publicKey).catch((error: JwtError) => {
      if (error.code === JwtErrorCode.NO_KID_IN_HEADER) {
        return this.verifyWithoutKid(token);
      }
      throw error;
    });
  }

  private verifyWithoutKid(token: string): Promise<void> {
    return this.keyFetcher
      .fetchPublicKeys()
      .then((publicKeys) => this.verifyWithAllKeys(token, publicKeys));
  }

  private verifyWithAllKeys(
    token: string,
    keys: { [key: string]: string }
  ): Promise<void> {
    const promises: Promise<boolean>[] = [];
    Object.values(keys).forEach((key) => {
      const result = verify(token, key)
        .then(() => true)
        .catch((error) => {
          if (error.code === JwtErrorCode.TOKEN_EXPIRED) {
            throw error;
          }
          return false;
        });
      promises.push(result);
    });

    return Promise.all(promises).then((result) => {
      if (result.every((r) => r === false)) {
        throw new JwtError(
          JwtErrorCode.INVALID_SIGNATURE,
          "Invalid token signature."
        );
      }
    });
  }
}

export class EmulatorSignatureVerifier implements SignatureVerifier {
  public async verify(token: string): Promise<void> {
    // Signature checks skipped for emulator; no need to fetch public keys.
    await verify(token, "");
  }
}

export async function fetchPublicKey(
  fetcher: KeyFetcher,
  header: ProtectedHeaderParameters
): Promise<string> {
  if (!header.kid) {
    throw new Error(NO_KID_IN_HEADER_ERROR_MESSAGE);
  }

  const kid = header.kid || "";
  const publicKeys = await fetcher.fetchPublicKeys();

  if (!Object.prototype.hasOwnProperty.call(publicKeys, kid)) {
    throw new Error(NO_MATCHING_KID_ERROR_MESSAGE);
  }

  return publicKeys[kid];
}
