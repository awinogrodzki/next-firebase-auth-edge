import {isNonNullObject, isURL} from './validator';
import {getPublicCryptoKey, verify, VerifyOptions} from './jwt/verify';
import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  errors,
  JWTPayload,
  KeyLike,
  ProtectedHeaderParameters
} from 'jose';
import {useEmulator} from './firebase';
import {AuthError, AuthErrorCode} from './error';
import {RemoteJWKSetOptions} from 'jose/dist/types/jwks/remote';

export const ALGORITHM_RS256 = 'RS256' as const;

type PublicKeys = {[key: string]: string};

interface PublicKeysResponse {
  keys: PublicKeys;
  expiresAt: number;
}

export type DecodedToken = {
  header: ProtectedHeaderParameters;
  payload: JWTPayload;
};

export interface SignatureVerifier {
  verify(token: string, options?: VerifyOptions): Promise<void>;
}

export interface KeyFetcher {
  fetchPublicKeys(): Promise<PublicKeys>;
}

function getExpiresAt(res: Response) {
  if (!res.headers.has('cache-control')) {
    return 0;
  }

  const cacheControlHeader: string = res.headers.get('cache-control')!;
  const parts = cacheControlHeader.split(',');
  const maxAge = parts.reduce((acc, part) => {
    const subParts = part.trim().split('=');
    if (subParts[0] === 'max-age') {
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
        'The provided public client certificate URL is not a valid URL.'
      );
    }
  }

  private async fetchPublicKeysResponse(url: URL): Promise<PublicKeysResponse> {
    const res = await fetch(url);

    if (!res.ok) {
      let errorMessage = 'Error fetching public keys for Google certs: ';
      const data = await res.json();
      if (data.error) {
        errorMessage += `${data.error}`;
        if (data.error_description) {
          errorMessage += ' (' + data.error_description + ')';
        }
      } else {
        errorMessage += `${await res.text()}`;
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(
        'Error fetching public keys for Google certs: ' + data.error
      );
    }

    const expiresAt = getExpiresAt(res);

    return {
      keys: data,
      expiresAt
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

    const {keys, expiresAt} = cachedResponse;
    const now = Date.now();

    if (expiresAt <= now) {
      return this.fetchAndCachePublicKeys(url);
    }

    return keys;
  }
}

export class JWKSSignatureVerifier implements SignatureVerifier {
  private jwksUrl: URL;

  constructor(jwksUrl: string, private options?: RemoteJWKSetOptions) {
    if (!isURL(jwksUrl)) {
      throw new Error('The provided JWKS URL is not a valid URL.');
    }

    this.jwksUrl = new URL(jwksUrl);
  }

  private async getPublicKey(
    header: ProtectedHeaderParameters
  ): Promise<KeyLike> {
    const getKey = createRemoteJWKSet(this.jwksUrl, this.options);

    return getKey(header);
  }

  public async verify(token: string, options?: VerifyOptions): Promise<void> {
    const header = decodeProtectedHeader(token);

    try {
      await verify(token, () => this.getPublicKey(header), options);
    } catch (e) {
      if (e instanceof errors.JWKSMultipleMatchingKeys) {
        for await (const publicKey of e) {
          try {
            await verify(token, () => Promise.resolve(publicKey), options);
            return;
          } catch (innerError) {
            if (innerError instanceof errors.JWSSignatureVerificationFailed) {
              continue;
            }
            throw innerError;
          }
        }
        throw new errors.JWSSignatureVerificationFailed();
      }

      throw e;
    }
  }
}

export class PublicKeySignatureVerifier implements SignatureVerifier {
  constructor(private keyFetcher: KeyFetcher) {
    if (!isNonNullObject(keyFetcher)) {
      throw new Error('The provided key fetcher is not an object or null.');
    }
  }

  public static withCertificateUrl(
    clientCertUrl: string
  ): PublicKeySignatureVerifier {
    return new PublicKeySignatureVerifier(new UrlKeyFetcher(clientCertUrl));
  }

  private async getPublicKey(
    header: ProtectedHeaderParameters,
    UNSAFE_expireOnInvalidKid: boolean
  ): Promise<KeyLike> {
    if (useEmulator()) {
      return {type: 'none'};
    }

    return fetchPublicKey(
      this.keyFetcher,
      header,
      UNSAFE_expireOnInvalidKid
    ).then(getPublicCryptoKey);
  }

  public async verify(token: string, options?: VerifyOptions): Promise<void> {
    const header = decodeProtectedHeader(token);

    try {
      await verify(
        token,
        () =>
          this.getPublicKey(
            header,
            options?.UNSAFE_expireTokenOnInvalidKidHeader ?? false
          ),
        options
      );
    } catch (e) {
      if (e instanceof AuthError && e.code === AuthErrorCode.NO_KID_IN_HEADER) {
        await this.verifyWithoutKid(
          token,
          options?.UNSAFE_expireTokenOnInvalidKidHeader ?? false
        );
        return;
      }

      throw e;
    }
  }

  private async verifyWithoutKid(
    token: string,
    UNSAFE_expireOnInvalidKid: boolean
  ): Promise<void> {
    const publicKeys = await this.keyFetcher.fetchPublicKeys();

    return this.verifyWithAllKeys(token, publicKeys, UNSAFE_expireOnInvalidKid);
  }

  private async verifyWithAllKeys(
    token: string,
    keys: {[key: string]: string},
    UNSAFE_expireOnInvalidKid: boolean
  ): Promise<void> {
    const promises: Promise<boolean>[] = [];

    Object.values(keys).forEach((key) => {
      const promise = verify(token, async () => getPublicCryptoKey(key))
        .then(() => true)
        .catch((error) => {
          if (error instanceof errors.JWTExpired) {
            throw error;
          }
          return false;
        });

      promises.push(promise);
    });

    const results = await Promise.all(promises);
    const hasNoValidKey = results.every((r) => r === false);

    if (hasNoValidKey && UNSAFE_expireOnInvalidKid) {
      throw new AuthError(AuthErrorCode.TOKEN_EXPIRED);
    }

    if (hasNoValidKey) {
      throw new AuthError(AuthErrorCode.INVALID_SIGNATURE);
    }
  }
}

export async function fetchPublicKey(
  fetcher: KeyFetcher,
  header: ProtectedHeaderParameters,
  UNSAFE_expireOnInvalidKid: boolean
): Promise<string> {
  if (!header.kid) {
    throw new AuthError(AuthErrorCode.NO_KID_IN_HEADER);
  }

  const kid = header.kid;
  const publicKeys = await fetcher.fetchPublicKeys();
  const hasNoMatchingKid = !Object.prototype.hasOwnProperty.call(
    publicKeys,
    kid
  );

  if (hasNoMatchingKid && UNSAFE_expireOnInvalidKid) {
    throw new AuthError(AuthErrorCode.TOKEN_EXPIRED);
  }

  if (hasNoMatchingKid) {
    throw new AuthError(AuthErrorCode.NO_MATCHING_KID);
  }

  return publicKeys[kid];
}
