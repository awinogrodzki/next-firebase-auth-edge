import {
  CryptoSigner,
  CryptoSignerError,
  CryptoSignerErrorCode,
  ServiceAccountSigner
} from './jwt/crypto-signer';
import { objectToBase64, stringToBase64 } from './jwt/utils';
import { isNonEmptyString, isNonNullObject } from './validator';
import { AuthClientErrorCode, ErrorInfo, FirebaseAuthError } from './error';
import { useEmulator } from './firebase';
import { ServiceAccountCredential } from './credential';

const ALGORITHM_NONE = 'none' as const;
const ONE_HOUR_IN_SECONDS = 60 * 60;

export const BLACKLISTED_CLAIMS = [
  'acr', 'amr', 'at_hash', 'aud', 'auth_time', 'azp', 'cnf', 'c_hash', 'exp', 'iat', 'iss', 'jti',
  'nbf', 'nonce',
];

const FIREBASE_AUDIENCE = 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit';

interface JWTHeader {
  alg: string;
  typ: string;
}

interface JWTBody {
  claims?: object;
  uid: string;
  aud: string;
  iat: number;
  exp: number;
  iss: string;
  sub: string;
  tenant_id?: string;
}


export class EmulatedSigner implements CryptoSigner {
  algorithm = ALGORITHM_NONE;

  public async sign(token: string): Promise<string> {
    return stringToBase64(token);
  }

  public getAccountId(): Promise<string> {
    return Promise.resolve('firebase-auth-emulator@example.com');
  }
}

export class FirebaseTokenGenerator {

  private readonly signer: CryptoSigner;

  constructor(signer: CryptoSigner, public readonly tenantId?: string) {
    if (!isNonNullObject(signer)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_CREDENTIAL,
        'INTERNAL ASSERT: Must provide a CryptoSigner to use FirebaseTokenGenerator.',
      );
    }
    if (typeof this.tenantId !== 'undefined' && !isNonEmptyString(this.tenantId)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_ARGUMENT,
        '`tenantId` argument must be a non-empty string.');
    }
    this.signer = signer;
  }

  public createCustomToken(uid: string, developerClaims?: {[key: string]: any}): Promise<string> {
    let errorMessage: string | undefined;
    if (!isNonEmptyString(uid)) {
      errorMessage = '`uid` argument must be a non-empty string uid.';
    } else if (uid.length > 128) {
      errorMessage = '`uid` argument must a uid with less than or equal to 128 characters.';
    } else if (!FirebaseTokenGenerator.isDeveloperClaimsValid_(developerClaims)) {
      errorMessage = '`developerClaims` argument must be a valid, non-null object containing the developer claims.';
    }

    if (errorMessage) {
      throw new FirebaseAuthError(AuthClientErrorCode.INVALID_ARGUMENT, errorMessage);
    }

    const claims: {[key: string]: any} = {};
    if (typeof developerClaims !== 'undefined') {
      for (const key in developerClaims) {
        /* istanbul ignore else */
        if (Object.prototype.hasOwnProperty.call(developerClaims, key)) {
          if (BLACKLISTED_CLAIMS.indexOf(key) !== -1) {
            throw new FirebaseAuthError(
              AuthClientErrorCode.INVALID_ARGUMENT,
              `Developer claim "${key}" is reserved and cannot be specified.`,
            );
          }
          claims[key] = developerClaims[key];
        }
      }
    }
    return this.signer.getAccountId().then(async (account) => {
      const header: JWTHeader = {
        alg: this.signer.algorithm,
        typ: 'JWT',
      };
      const iat = Math.floor(Date.now() / 1000);
      const body: JWTBody = {
        aud: FIREBASE_AUDIENCE,
        iat,
        exp: iat + ONE_HOUR_IN_SECONDS,
        iss: account,
        sub: account,
        uid,
      };
      if (this.tenantId) {
        body.tenant_id = this.tenantId;
      }
      if (Object.keys(claims).length > 0) {
        body.claims = claims;
      }
      const token = `${FirebaseTokenGenerator.encodeSegment(header)}.${FirebaseTokenGenerator.encodeSegment(body)}`;
      const signPromise = await this.signer.sign(token);

      return Promise.all([token, signPromise]);
    }).then(([token, signature]) => {
      return `${token}.${signature}`;
    }).catch((err) => {
      throw handleCryptoSignerError(err);
    });
  }

  private static encodeSegment(segment: object | string): string {
    if (typeof segment === 'object') {
      return objectToBase64(segment);
    }

    return stringToBase64(segment);
  }

  private static isDeveloperClaimsValid_(developerClaims?: object): boolean {
    if (typeof developerClaims === 'undefined') {
      return true;
    }
    return isNonNullObject(developerClaims);
  }
}

export function handleCryptoSignerError(err: Error): Error {
  if (!(err instanceof CryptoSignerError)) {
    return err;
  }
  if (err.code === CryptoSignerErrorCode.SERVER_ERROR && isNonNullObject(err.cause)) {

    return new FirebaseAuthError(AuthClientErrorCode.INTERNAL_ERROR,
      'Error returned from server: ' + err.cause?.message + '. Additionally, an ' +
      'internal error occurred while attempting to extract the ' +
      'errorcode from the error.'
    );
  }
  return new FirebaseAuthError(mapToAuthClientErrorCode(err.code), err.message);
}

function mapToAuthClientErrorCode(code: string): ErrorInfo {
  switch (code) {
    case CryptoSignerErrorCode.INVALID_CREDENTIAL:
      return AuthClientErrorCode.INVALID_CREDENTIAL;
    case CryptoSignerErrorCode.INVALID_ARGUMENT:
      return AuthClientErrorCode.INVALID_ARGUMENT;
    default:
      return AuthClientErrorCode.INTERNAL_ERROR;
  }
}

export function createFirebaseTokenGenerator(
  credential: ServiceAccountCredential,
  tenantId?: string): FirebaseTokenGenerator {
  try {
    const signer = useEmulator() ? new EmulatedSigner() : new ServiceAccountSigner(credential);
    return new FirebaseTokenGenerator(signer, tenantId);
  } catch (err: any) {
    throw handleCryptoSignerError(err);
  }
}
