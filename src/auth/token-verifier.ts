import {decodeJwt, decodeProtectedHeader, errors} from 'jose';
import {JOSEError} from 'jose/dist/types/util/errors';
import {AuthError, AuthErrorCode} from './error.js';
import {CLIENT_CERT_URL, FIREBASE_AUDIENCE, useEmulator} from './firebase.js';
import {ALGORITHM_RS256} from './jwt/verify.js';
import {
  DecodedToken,
  PublicKeySignatureVerifier,
  SignatureVerifier
} from './signature-verifier';
import {DecodedIdToken, VerifyOptions} from './types.js';
import {mapJwtPayloadToDecodedIdToken} from './utils.js';
import {isURL} from './validator.js';

export class FirebaseTokenVerifier {
  private readonly signatureVerifier: SignatureVerifier;

  constructor(
    clientCertUrl: string,
    private issuer: string,
    private projectId: string,
    private tenantId?: string
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
    options: VerifyOptions
  ): Promise<DecodedIdToken> {
    const decoded = await this.decodeAndVerify(
      jwtToken,
      this.projectId,
      options
    );

    const decodedIdToken = mapJwtPayloadToDecodedIdToken(decoded.payload);

    if (this.tenantId && decodedIdToken.firebase.tenant !== this.tenantId) {
      throw new AuthError(AuthErrorCode.MISMATCHING_TENANT_ID);
    }

    return decodedIdToken;
  }

  private async decodeAndVerify(
    token: string,
    projectId: string,
    options: VerifyOptions
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
    } else if (payload.sub === '') {
      errorMessage = `idToken has an empty string "sub" (subject) claim.`;
    } else if (typeof payload.sub === 'string' && payload.sub.length > 128) {
      errorMessage = `idToken has "sub" (subject) claim longer than 128 characters.`;
    }

    if (errorMessage) {
      throw new AuthError(AuthErrorCode.INVALID_ARGUMENT, errorMessage);
    }
  }

  private verifySignature(
    jwtToken: string,
    options: VerifyOptions
  ): Promise<void> {
    return this.signatureVerifier.verify(jwtToken, options).catch((error) => {
      throw this.mapJoseErrorToAuthError(error);
    });
  }

  private mapJoseErrorToAuthError(error: JOSEError): Error {
    if (error instanceof errors.JWTExpired) {
      return AuthError.fromError(
        error,
        AuthErrorCode.TOKEN_EXPIRED,
        error.message
      );
    }

    if (error instanceof errors.JWSSignatureVerificationFailed) {
      return AuthError.fromError(error, AuthErrorCode.INVALID_SIGNATURE);
    }

    if (error instanceof AuthError) {
      return error;
    }

    return AuthError.fromError(
      error,
      AuthErrorCode.INTERNAL_ERROR,
      error.message
    );
  }
}

export function createIdTokenVerifier(
  projectId: string,
  tenantId?: string
): FirebaseTokenVerifier {
  return new FirebaseTokenVerifier(
    CLIENT_CERT_URL,
    'https://securetoken.google.com/',
    projectId,
    tenantId
  );
}
