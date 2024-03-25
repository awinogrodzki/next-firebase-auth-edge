import { decodeJwt, decodeProtectedHeader, errors } from 'jose';
import { JOSEError } from 'jose/dist/types/util/errors';
import { AuthError, AuthErrorCode } from './error';
import { CLIENT_CERT_URL, FIREBASE_AUDIENCE, useEmulator } from './firebase';
import { VerifyOptions } from './jwt/verify';
import {
  ALGORITHM_RS256,
  DecodedToken,
  PublicKeySignatureVerifier,
  SignatureVerifier
} from './signature-verifier';
import { mapJwtPayloadToDecodedIdToken } from './utils';
import { isURL } from './validator';

export interface FirebaseClaims {
  identities: {
    [key: string]: any;
  };
  sign_in_provider: string;
  sign_in_second_factor?: string;
  second_factor_identifier?: string;
  tenant?: string;
  [key: string]: any;
}

export interface DecodedIdToken {
  aud: string;
  auth_time: number;
  email?: string;
  email_verified?: boolean;
  exp: number;
  firebase: FirebaseClaims;
  source_sign_in_provider: string;
  iat: number;
  iss: string;
  phone_number?: string;
  picture?: string;
  sub: string;
  uid: string;
  [key: string]: any;
}

export class FirebaseTokenVerifier {
  private readonly signatureVerifier: SignatureVerifier;

  constructor(
    clientCertUrl: string,
    private issuer: string,
    private projectId: string
  ) {
    if (!isURL(clientCertUrl)) {
      throw new AuthError(
        AuthErrorCode.INVALID_ARGUMENT,
        'The provided public client certificate URL is an invalid URL.'
      );
    }

    this.signatureVerifier =
      PublicKeySignatureVerifier.withCertificateUrl(clientCertUrl);
  }

  public async verifyJWT(
    jwtToken: string,
    options?: VerifyOptions
  ): Promise<DecodedIdToken> {
    const decoded = await this.decodeAndVerify(
      jwtToken,
      this.projectId,
      options
    );

    return mapJwtPayloadToDecodedIdToken(decoded.payload);
  }

  private async decodeAndVerify(
    token: string,
    projectId: string,
    options?: VerifyOptions
  ): Promise<DecodedToken> {
    const header = decodeProtectedHeader(token);
    const payload = decodeJwt(token);

    this.verifyContent({header, payload}, projectId);
    await this.verifySignature(token, options);

    return {header, payload};
  }

  private verifyContent(
    fullDecodedToken: DecodedToken,
    projectId: string | null
  ): void {
    const header = fullDecodedToken && fullDecodedToken.header;
    const payload = fullDecodedToken && fullDecodedToken.payload;

    let errorMessage: string | undefined;
    if (!useEmulator() && typeof header.kid === 'undefined') {
      const isCustomToken = payload.aud === FIREBASE_AUDIENCE;
      if (isCustomToken) {
        errorMessage = `idToken was expected, but custom token was provided`;
      } else {
        errorMessage = `idToken has no "kid" claim.`;
      }
    } else if (!useEmulator() && header.alg !== ALGORITHM_RS256) {
      errorMessage = `Incorrect algorithm. ${ALGORITHM_RS256} expected, ${header.alg} provided`;
    } else if (payload.iss !== this.issuer + projectId) {
      errorMessage = `idToken has incorrect "iss" (issuer) claim. Expected ${this.issuer}${projectId}, but got ${payload.iss}`;
    } else if (typeof payload.sub !== 'string') {
    } else if (payload.sub === '') {
      errorMessage = `idToken has an empty string "sub" (subject) claim.`;
    } else if (payload.sub.length > 128) {
      errorMessage = `idToken has "sub" (subject) claim longer than 128 characters.`;
    }

    if (errorMessage) {
      throw new AuthError(AuthErrorCode.INVALID_ARGUMENT, errorMessage);
    }
  }

  private verifySignature(
    jwtToken: string,
    options?: VerifyOptions
  ): Promise<void> {
    return this.signatureVerifier.verify(jwtToken, options).catch((error) => {
      throw this.mapJoseErrorToAuthError(error);
    });
  }

  private mapJoseErrorToAuthError(error: JOSEError): Error {
    if (error instanceof errors.JWTExpired) {
      return new AuthError(AuthErrorCode.TOKEN_EXPIRED, error.message);
    }

    if (error instanceof errors.JWSSignatureVerificationFailed) {
      return new AuthError(AuthErrorCode.INVALID_SIGNATURE);
    }

    if (
      error instanceof AuthError &&
      error.code === AuthErrorCode.NO_MATCHING_KID
    ) {
      const message = `idToken has "kid" claim which does not correspond to a known public key. Most likely the token is expired, so get a fresh token from your client app and try again.`;
      return new AuthError(AuthErrorCode.INVALID_ARGUMENT, message);
    }

    return new AuthError(AuthErrorCode.INTERNAL_ERROR, error.message);
  }
}

export function createIdTokenVerifier(
  projectId: string
): FirebaseTokenVerifier {
  return new FirebaseTokenVerifier(
    CLIENT_CERT_URL,
    'https://securetoken.google.com/',
    projectId
  );
}
