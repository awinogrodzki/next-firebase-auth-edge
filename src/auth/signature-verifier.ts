import { isNonNullObject, isString, isURL } from './validator';
import { JwtError, JwtErrorCode } from './jwt/error';
import { decode } from './jwt';
import { verify } from './jwt/verify';
import { DecodedJWTHeader } from './jwt/types';

export const ALGORITHM_RS256 = 'RS256' as const;
const NO_MATCHING_KID_ERROR_MESSAGE = 'no-matching-kid-error';
const NO_KID_IN_HEADER_ERROR_MESSAGE = 'no-kid-in-header-error';

export type Dictionary = { [key: string]: any }

export type DecodedToken = {
  header: Dictionary;
  payload: Dictionary;
}

export interface SignatureVerifier {
  verify(token: string): Promise<void>;
}

interface KeyFetcher {
  fetchPublicKeys(): Promise<{ [key: string]: string }>;
}


export class UrlKeyFetcher implements KeyFetcher {
  private publicKeys: { [key: string]: string } = {};
  private publicKeysExpireAt = 0;

  constructor(private clientCertUrl: string) {
    if (!isURL(clientCertUrl)) {
      throw new Error(
        'The provided public client certificate URL is not a valid URL.',
      );
    }
  }

  public fetchPublicKeys(): Promise<{ [key: string]: string }> {
    if (this.shouldRefresh()) {
      return this.refresh();
    }
    return Promise.resolve(this.publicKeys);
  }

  private shouldRefresh(): boolean {
    return !this.publicKeys || this.publicKeysExpireAt <= Date.now();
  }

  private async refresh(): Promise<{ [key: string]: string }> {
    const res = await fetch(this.clientCertUrl, {
      method: 'GET'
    })

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
      throw new JwtError(JwtErrorCode.KEY_FETCH_ERROR, data.error);
    }

    this.publicKeysExpireAt = 0;

    if (res.headers.has('cache-control')) {
      const cacheControlHeader: string = res.headers.get('cache-control')!;
      const parts = cacheControlHeader.split(',');
      parts.forEach((part) => {
        const subParts = part.trim().split('=');
        if (subParts[0] === 'max-age') {
          const maxAge: number = +subParts[1];
          this.publicKeysExpireAt = Date.now() + (maxAge * 1000);
        }
      });
    }

    this.publicKeys = data;
    return data;
  }
}

export class PublicKeySignatureVerifier implements SignatureVerifier {
  constructor(private keyFetcher: KeyFetcher) {
    if (!isNonNullObject(keyFetcher)) {
      throw new Error('The provided key fetcher is not an object or null.');
    }
  }

  public static withCertificateUrl(clientCertUrl: string): PublicKeySignatureVerifier {
    return new PublicKeySignatureVerifier(new UrlKeyFetcher(clientCertUrl));
  }

  public async verify(token: string): Promise<void> {
    if (!isString(token)) {
      return Promise.reject(new JwtError(JwtErrorCode.INVALID_ARGUMENT,
        'The provided token must be a string.'));
    }

    const decoded = decode(token, {complete: true});
    const publicKey = await getKey(this.keyFetcher, decoded.header);

    return verifyJwtSignature(token, publicKey)
      .catch((error: JwtError) => {
        if (error.code === JwtErrorCode.NO_KID_IN_HEADER) {
          return this.verifyWithoutKid(token);
        }
        throw error;
      });
  }

  private verifyWithoutKid(token: string): Promise<void> {
    return this.keyFetcher.fetchPublicKeys()
      .then(publicKeys => this.verifyWithAllKeys(token, publicKeys));
  }

  private verifyWithAllKeys(token: string, keys: { [key: string]: string }): Promise<void> {
    const promises: Promise<boolean>[] = [];
    Object.values(keys).forEach((key) => {
      const result = verifyJwtSignature(token, key)
        .then(() => true)
        .catch((error) => {
          if (error.code === JwtErrorCode.TOKEN_EXPIRED) {
            throw error;
          }
          return false;
        })
      promises.push(result);
    });

    return Promise.all(promises)
      .then((result) => {
        if (result.every((r) => r === false)) {
          throw new JwtError(JwtErrorCode.INVALID_SIGNATURE, 'Invalid token signature.');
        }
      });
  }
}

export class EmulatorSignatureVerifier implements SignatureVerifier {
  public verify(token: string): Promise<void> {
    return verifyJwtSignature(token, '');
  }
}

async function getKey(fetcher: KeyFetcher, header: DecodedJWTHeader): Promise<string> {
  if (!header.kid) {
    throw new Error(NO_KID_IN_HEADER_ERROR_MESSAGE);
  }

  const kid = header.kid || '';
  const publicKeys = await fetcher.fetchPublicKeys();

  if (!Object.prototype.hasOwnProperty.call(publicKeys, kid)) {
    throw new Error(NO_MATCHING_KID_ERROR_MESSAGE)
  }

  return publicKeys[kid];
}

export async function verifyJwtSignature(token: string, secretOrPublicKey: string): Promise<void> {
  if (!token) {
    throw new JwtError(JwtErrorCode.INVALID_ARGUMENT,'The provided token must be a string.')
  }

  await verify(token, secretOrPublicKey);
}

export function decodeJwt(jwtToken: string): Promise<DecodedToken> {
  if (!isString(jwtToken)) {
    return Promise.reject(new JwtError(JwtErrorCode.INVALID_ARGUMENT,
      'The provided token must be a string.'));
  }

  const fullDecodedToken: any = decode(jwtToken, {
    complete: true,
  });

  if (!fullDecodedToken) {
    return Promise.reject(new JwtError(JwtErrorCode.INVALID_ARGUMENT,
      'Decoding token failed.'));
  }

  const header = fullDecodedToken?.header;
  const payload = fullDecodedToken?.payload;
  return Promise.resolve({ header, payload });
}
