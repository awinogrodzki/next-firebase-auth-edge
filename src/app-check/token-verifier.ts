import {
  ALGORITHM_RS256,
  DecodedToken,
  JWKSSignatureVerifier,
  SignatureVerifier,
} from "../auth/signature-verifier";
import { DecodedAppCheckToken } from "./types";
import { decodeJwt, decodeProtectedHeader, errors } from "jose";
import { VerifyOptions } from "../auth/jwt/verify";
import { JOSEError } from "jose/dist/types/util/errors";
import { FirebaseAppCheckError } from "./api-client";

const APP_CHECK_ISSUER = "https://firebaseappcheck.googleapis.com/";
const JWKS_URL = "https://firebaseappcheck.googleapis.com/v1/jwks";

export class AppCheckTokenVerifier {
  private readonly signatureVerifier: SignatureVerifier;

  constructor(private readonly projectId: string) {
    this.signatureVerifier = new JWKSSignatureVerifier(JWKS_URL);
  }

  public async verifyToken(
    token: string,
    options?: VerifyOptions
  ): Promise<DecodedAppCheckToken> {
    const decoded = await this.decodeAndVerify(token, this.projectId, options);

    const decodedAppCheckToken = decoded.payload as DecodedAppCheckToken;
    decodedAppCheckToken.app_id = decodedAppCheckToken.sub;
    return decodedAppCheckToken;
  }

  private async decodeAndVerify(
    token: string,
    projectId: string,
    options?: VerifyOptions
  ): Promise<DecodedToken> {
    const header = decodeProtectedHeader(token);
    const payload = decodeJwt(token);

    this.verifyContent({ header, payload }, projectId);
    await this.verifySignature(token, options);

    return { header, payload };
  }

  private verifyContent(
    fullDecodedToken: DecodedToken,
    projectId: string | null
  ): void {
    const header = fullDecodedToken.header;
    const payload = fullDecodedToken.payload;

    const projectIdMatchMessage =
      " Make sure the App Check token comes from the same " +
      "Firebase project as the service account used to authenticate this SDK.";
    const scopedProjectId = `projects/${projectId}`;

    let errorMessage: string | undefined;
    if (header.alg !== ALGORITHM_RS256) {
      errorMessage =
        'The provided App Check token has incorrect algorithm. Expected "' +
        ALGORITHM_RS256 +
        '" but got ' +
        '"' +
        header.alg +
        '".';
    } else if (!payload.aud?.includes(scopedProjectId) ?? false) {
      errorMessage =
        'The provided App Check token has incorrect "aud" (audience) claim. Expected "' +
        scopedProjectId +
        '" but got "' +
        payload.aud +
        '".' +
        projectIdMatchMessage;
    } else if (
      typeof payload.iss !== "string" ||
      !payload.iss.startsWith(APP_CHECK_ISSUER)
    ) {
      errorMessage =
        'The provided App Check token has incorrect "iss" (issuer) claim.';
    } else if (typeof payload.sub !== "string") {
      errorMessage =
        'The provided App Check token has no "sub" (subject) claim.';
    } else if (payload.sub === "") {
      errorMessage =
        'The provided App Check token has an empty string "sub" (subject) claim.';
    }
    if (errorMessage) {
      throw new FirebaseAppCheckError("invalid-argument", errorMessage);
    }
  }

  private verifySignature(
    jwtToken: string,
    options?: VerifyOptions
  ): Promise<void> {
    return this.signatureVerifier
      .verify(jwtToken, options)
      .catch((error: JOSEError) => {
        throw this.mapJwtErrorToAppCheckError(error);
      });
  }

  private mapJwtErrorToAppCheckError(error: JOSEError): FirebaseAppCheckError {
    if (error instanceof errors.JWTExpired) {
      const errorMessage =
        "The provided App Check token has expired. Get a fresh App Check token" +
        " from your client app and try again.";
      return new FirebaseAppCheckError("app-check-token-expired", errorMessage);
    } else if (error instanceof errors.JWSSignatureVerificationFailed) {
      const errorMessage =
        "The provided App Check token has invalid signature.";
      return new FirebaseAppCheckError("invalid-argument", errorMessage);
    } else if (error instanceof errors.JWKSNoMatchingKey) {
      const errorMessage =
        'The provided App Check token has "kid" claim which does not ' +
        "correspond to a known public key. Most likely the provided App Check token " +
        "is expired, so get a fresh token from your client app and try again.";
      return new FirebaseAppCheckError("invalid-argument", errorMessage);
    }
    return new FirebaseAppCheckError("invalid-argument", error.message);
  }
}
