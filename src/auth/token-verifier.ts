import { CLIENT_CERT_URL, FIREBASE_AUDIENCE } from "./firebase";
import {
  ALGORITHM_RS256,
  DecodedToken,
  EmulatorSignatureVerifier,
  PublicKeySignatureVerifier,
  SignatureVerifier,
} from "./signature-verifier";
import { isURL } from "./validator";
import { AuthClientErrorCode, FirebaseAuthError } from "./error";
import { decodeJwt, decodeProtectedHeader } from "jose";
import { JOSEError } from "jose/dist/types/util/errors";

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
  iss: string;
  phone_number?: string;
  picture?: string;
  sub: string;
  uid: string;
  [key: string]: any;
}

const EMULATOR_VERIFIER = new EmulatorSignatureVerifier();

export class FirebaseTokenVerifier {
  private readonly signatureVerifier: SignatureVerifier;

  constructor(
    clientCertUrl: string,
    private issuer: string,
    private projectId: string
  ) {
    if (!isURL(clientCertUrl)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_ARGUMENT,
        "The provided public client certificate URL is an invalid URL."
      );
    }

    this.signatureVerifier =
      PublicKeySignatureVerifier.withCertificateUrl(clientCertUrl);
  }

  public async verifyJWT(
    jwtToken: string,
    isEmulator = false
  ): Promise<DecodedIdToken> {
    const decoded = await this.decodeAndVerify(
      jwtToken,
      this.projectId,
      isEmulator
    );

    const decodedIdToken = decoded.payload as DecodedIdToken;
    decodedIdToken.uid = decodedIdToken.sub;
    return decodedIdToken;
  }

  private async decodeAndVerify(
    token: string,
    projectId: string,
    isEmulator: boolean,
    audience?: string
  ): Promise<DecodedToken> {
    const header = decodeProtectedHeader(token);
    const payload = decodeJwt(token);

    this.verifyContent({ header, payload }, projectId, isEmulator, audience);
    await this.verifySignature(token, isEmulator);

    return { header, payload };
  }

  private verifyContent(
    fullDecodedToken: DecodedToken,
    projectId: string | null,
    isEmulator: boolean,
    audience: string | undefined
  ): void {
    const header = fullDecodedToken && fullDecodedToken.header;
    const payload = fullDecodedToken && fullDecodedToken.payload;

    let errorMessage: string | undefined;
    if (!isEmulator && typeof header.kid === "undefined") {
      const isCustomToken = payload.aud === FIREBASE_AUDIENCE;
      if (isCustomToken) {
        errorMessage = `idToken was expected, but custom token was provided`;
      } else {
        errorMessage = `idToken has no "kid" claim.`;
      }
    } else if (!isEmulator && header.alg !== ALGORITHM_RS256) {
      errorMessage = `Incorrect algorithm. ${ALGORITHM_RS256} expected, ${header.alg} provided`;
    } else if (
      typeof audience !== "undefined" &&
      !(payload.aud as string).includes(audience)
    ) {
      errorMessage = `idToken has incorrect "aud" (audience) claim. Expected ${audience}, but got ${payload.aud}`;
    } else if (typeof audience === "undefined" && payload.aud !== projectId) {
      errorMessage = `idToken has incorrect "aud" (audience) claim. Expected ${projectId}, but got ${payload.aud}`;
    } else if (payload.iss !== this.issuer + projectId) {
      errorMessage = `idToken has incorrect "iss" (issuer) claim. Expected ${this.issuer}${projectId}, but got ${payload.iss}`;
    } else if (typeof payload.sub !== "string") {
    } else if (payload.sub === "") {
      errorMessage = `idToken has an empty string "sub" (subject) claim.`;
    } else if (payload.sub.length > 128) {
      errorMessage = `idToken has "sub" (subject) claim longer than 128 characters.`;
    }

    if (errorMessage) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_ARGUMENT,
        errorMessage
      );
    }
  }

  private verifySignature(
    jwtToken: string,
    isEmulator: boolean
  ): Promise<void> {
    const verifier = isEmulator ? EMULATOR_VERIFIER : this.signatureVerifier;
    return verifier.verify(jwtToken).catch((error) => {
      throw this.mapJwtErrorToAuthError(error);
    });
  }

  private mapJwtErrorToAuthError(error: JOSEError): Error {
    return FirebaseAuthError.fromJOSEError(error);
  }
}

export function createIdTokenVerifier(
  projectId: string
): FirebaseTokenVerifier {
  return new FirebaseTokenVerifier(
    CLIENT_CERT_URL,
    "https://securetoken.google.com/",
    projectId
  );
}
