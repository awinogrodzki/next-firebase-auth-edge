import {
  CLIENT_CERT_URL,
  FIREBASE_AUDIENCE,
  FirebaseTokenInfo,
  ID_TOKEN_INFO
} from './firebase';
import {
  ALGORITHM_RS256,
  DecodedToken,
  decodeJwt,
  EmulatorSignatureVerifier,
  PublicKeySignatureVerifier,
  SignatureVerifier
} from './jwt';
import { isNonEmptyString, isNonNullObject, isString, isURL } from './validator';
import { AuthClientErrorCode, FirebaseAuthError } from './error';
import { JwtError, JwtErrorCode } from './jwt-utils/jwt/error';

export interface DecodedIdToken {
  aud: string;
  auth_time: number;
  email?: string;
  email_verified?: boolean;
  exp: number;
  firebase: {
    identities: {
      [key: string]: any;
    };
    sign_in_provider: string;
    sign_in_second_factor?: string;
    second_factor_identifier?: string;
    tenant?: string;
    [key: string]: any;
  };
  iat: number;
  iss: string
  phone_number?: string;
  picture?: string;
  sub: string;
  uid: string;
  [key: string]: any;
}

const EMULATOR_VERIFIER = new EmulatorSignatureVerifier();

export class FirebaseTokenVerifier {
  private readonly shortNameArticle: string;
  private readonly signatureVerifier: SignatureVerifier;

  constructor(clientCertUrl: string, private issuer: string, private tokenInfo: FirebaseTokenInfo, private projectId: string) {

    if (!isURL(clientCertUrl)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_ARGUMENT,
        'The provided public client certificate URL is an invalid URL.',
      );
    } else if (!isURL(issuer)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_ARGUMENT,
        'The provided JWT issuer is an invalid URL.',
      );
    } else if (!isNonNullObject(tokenInfo)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_ARGUMENT,
        'The provided JWT information is not an object or null.',
      );
    } else if (!isURL(tokenInfo.url)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_ARGUMENT,
        'The provided JWT verification documentation URL is invalid.',
      );
    } else if (!isNonEmptyString(tokenInfo.verifyApiName)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_ARGUMENT,
        'The JWT verify API name must be a non-empty string.',
      );
    } else if (!isNonEmptyString(tokenInfo.jwtName)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_ARGUMENT,
        'The JWT public full name must be a non-empty string.',
      );
    } else if (!isNonEmptyString(tokenInfo.shortName)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_ARGUMENT,
        'The JWT public short name must be a non-empty string.',
      );
    } else if (!isNonNullObject(tokenInfo.expiredErrorCode) || !('code' in tokenInfo.expiredErrorCode)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_ARGUMENT,
        'The JWT expiration error code must be a non-null ErrorInfo object.',
      );
    }
    this.shortNameArticle = tokenInfo.shortName.charAt(0).match(/[aeiou]/i) ? 'an' : 'a';

    this.signatureVerifier =
      PublicKeySignatureVerifier.withCertificateUrl(clientCertUrl);
  }

  public async verifyJWT(jwtToken: string, isEmulator = false): Promise<DecodedIdToken> {
    if (!isString(jwtToken)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_ARGUMENT,
        `First argument to ${this.tokenInfo.verifyApiName} must be a ${this.tokenInfo.jwtName} string.`,
      );
    }

    const decoded = await this.decodeAndVerify(jwtToken, this.projectId, isEmulator)

    const decodedIdToken = decoded.payload as DecodedIdToken;
    decodedIdToken.uid = decodedIdToken.sub;
    return decodedIdToken;
  }

  private decodeAndVerify(
    token: string,
    projectId: string,
    isEmulator: boolean,
    audience?: string): Promise<DecodedToken> {
    return this.safeDecode(token)
      .then((decodedToken) => {
        this.verifyContent(decodedToken, projectId, isEmulator, audience);
        return this.verifySignature(token, isEmulator)
          .then(() => decodedToken);
      });
  }

  private safeDecode(jwtToken: string): Promise<DecodedToken> {
    return decodeJwt(jwtToken)
      .catch((err: JwtError) => {
        if (err.code == JwtErrorCode.INVALID_ARGUMENT) {
          const verifyJwtTokenDocsMessage = ` See ${this.tokenInfo.url} ` +
            `for details on how to retrieve ${this.shortNameArticle} ${this.tokenInfo.shortName}.`;
          const errorMessage = `Decoding ${this.tokenInfo.jwtName} failed. Make sure you passed ` +
            `the entire string JWT which represents ${this.shortNameArticle} ` +
            `${this.tokenInfo.shortName}.` + verifyJwtTokenDocsMessage;
          throw new FirebaseAuthError(AuthClientErrorCode.INVALID_ARGUMENT,
            errorMessage);
        }
        throw new FirebaseAuthError(AuthClientErrorCode.INTERNAL_ERROR, err.message);
      });
  }

  private verifyContent(
    fullDecodedToken: DecodedToken,
    projectId: string | null,
    isEmulator: boolean,
    audience: string | undefined): void {
    const header = fullDecodedToken && fullDecodedToken.header;
    const payload = fullDecodedToken && fullDecodedToken.payload;

    const projectIdMatchMessage = ` Make sure the ${this.tokenInfo.shortName} comes from the same ` +
      'Firebase project as the service account used to authenticate this SDK.';
    const verifyJwtTokenDocsMessage = ` See ${this.tokenInfo.url} ` +
      `for details on how to retrieve ${this.shortNameArticle} ${this.tokenInfo.shortName}.`;

    let errorMessage: string | undefined;
    if (!isEmulator && typeof header.kid === 'undefined') {
      const isCustomToken = (payload.aud === FIREBASE_AUDIENCE);
      const isLegacyCustomToken = (header.alg === 'HS256' && payload.v === 0 && 'd' in payload && 'uid' in payload.d);

      if (isCustomToken) {
        errorMessage = `${this.tokenInfo.verifyApiName} expects ${this.shortNameArticle} ` +
          `${this.tokenInfo.shortName}, but was given a custom token.`;
      } else if (isLegacyCustomToken) {
        errorMessage = `${this.tokenInfo.verifyApiName} expects ${this.shortNameArticle} ` +
          `${this.tokenInfo.shortName}, but was given a legacy custom token.`;
      } else {
        errorMessage = `${this.tokenInfo.jwtName} has no "kid" claim.`;
      }

      errorMessage += verifyJwtTokenDocsMessage;
    } else if (!isEmulator && header.alg !== ALGORITHM_RS256) {
      errorMessage = `${this.tokenInfo.jwtName} has incorrect algorithm. Expected "` + ALGORITHM_RS256 + '" but got ' +
        '"' + header.alg + '".' + verifyJwtTokenDocsMessage;
    } else if (typeof audience !== 'undefined' && !(payload.aud as string).includes(audience)) {
      errorMessage = `${this.tokenInfo.jwtName} has incorrect "aud" (audience) claim. Expected "` +
        audience + '" but got "' + payload.aud + '".' + verifyJwtTokenDocsMessage;
    } else if (typeof audience === 'undefined' && payload.aud !== projectId) {
      errorMessage = `${this.tokenInfo.jwtName} has incorrect "aud" (audience) claim. Expected "` +
        projectId + '" but got "' + payload.aud + '".' + projectIdMatchMessage +
        verifyJwtTokenDocsMessage;
    } else if (payload.iss !== this.issuer + projectId) {
      errorMessage = `${this.tokenInfo.jwtName} has incorrect "iss" (issuer) claim. Expected ` +
        `"${this.issuer}` + projectId + '" but got "' +
        payload.iss + '".' + projectIdMatchMessage + verifyJwtTokenDocsMessage;
    } else if (typeof payload.sub !== 'string') {
      errorMessage = `${this.tokenInfo.jwtName} has no "sub" (subject) claim.` + verifyJwtTokenDocsMessage;
    } else if (payload.sub === '') {
      errorMessage = `${this.tokenInfo.jwtName} has an empty string "sub" (subject) claim.` + verifyJwtTokenDocsMessage;
    } else if (payload.sub.length > 128) {
      errorMessage = `${this.tokenInfo.jwtName} has "sub" (subject) claim longer than 128 characters.` +
        verifyJwtTokenDocsMessage;
    }
    if (errorMessage) {
      throw new FirebaseAuthError(AuthClientErrorCode.INVALID_ARGUMENT, errorMessage);
    }
  }

  private verifySignature(jwtToken: string, isEmulator: boolean):
    Promise<void> {
    const verifier = isEmulator ? EMULATOR_VERIFIER : this.signatureVerifier;
    return verifier.verify(jwtToken)
      .catch((error) => {
        throw this.mapJwtErrorToAuthError(error);
      });
  }

  /**
   * Maps JwtError to FirebaseAuthError
   *
   * @param error - JwtError to be mapped.
   * @returns FirebaseAuthError or Error instance.
   */
  private mapJwtErrorToAuthError(error: JwtError): Error {
    const verifyJwtTokenDocsMessage = ` See ${this.tokenInfo.url} ` +
      `for details on how to retrieve ${this.shortNameArticle} ${this.tokenInfo.shortName}.`;
    if (error.code === JwtErrorCode.TOKEN_EXPIRED) {
      const errorMessage = `${this.tokenInfo.jwtName} has expired. Get a fresh ${this.tokenInfo.shortName}` +
        ` from your client app and try again (auth/${this.tokenInfo.expiredErrorCode.code}).` +
        verifyJwtTokenDocsMessage;
      return new FirebaseAuthError(this.tokenInfo.expiredErrorCode, errorMessage);
    } else if (error.code === JwtErrorCode.INVALID_SIGNATURE) {
      const errorMessage = `${this.tokenInfo.jwtName} has invalid signature.` + verifyJwtTokenDocsMessage;
      return new FirebaseAuthError(AuthClientErrorCode.INVALID_ARGUMENT, errorMessage);
    } else if (error.code === JwtErrorCode.NO_MATCHING_KID) {
      const errorMessage = `${this.tokenInfo.jwtName} has "kid" claim which does not ` +
        `correspond to a known public key. Most likely the ${this.tokenInfo.shortName} ` +
        'is expired, so get a fresh token from your client app and try again.';
      return new FirebaseAuthError(AuthClientErrorCode.INVALID_ARGUMENT, errorMessage);
    }
    return new FirebaseAuthError(AuthClientErrorCode.INVALID_ARGUMENT, error.message);
  }
}

export function createIdTokenVerifier(projectId: string): FirebaseTokenVerifier {
  return new FirebaseTokenVerifier(
    CLIENT_CERT_URL,
    'https://securetoken.google.com/',
    ID_TOKEN_INFO,
    projectId
  );
}
