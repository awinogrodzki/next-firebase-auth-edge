import { CryptoSigner, ServiceAccountSigner } from "./jwt/crypto-signer";
import { isNonNullObject } from "./validator";
import { ServiceAccountCredential } from "./credential";
import { JWTPayload } from "jose";
import { AuthError, AuthErrorCode } from "./error";

const ONE_HOUR_IN_SECONDS = 60 * 60;

export const BLACKLISTED_CLAIMS = [
  "acr",
  "amr",
  "at_hash",
  "aud",
  "auth_time",
  "azp",
  "cnf",
  "c_hash",
  "exp",
  "iat",
  "iss",
  "jti",
  "nbf",
  "nonce",
];

const FIREBASE_AUDIENCE =
  "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit";

export class FirebaseTokenGenerator {
  private readonly signer: CryptoSigner;

  constructor(signer: CryptoSigner, public readonly tenantId?: string) {
    this.signer = signer;
  }

  public createCustomToken(
    uid: string,
    developerClaims?: { [key: string]: any }
  ): Promise<string> {
    let errorMessage: string | undefined;
    if (uid.length > 128) {
      errorMessage =
        "`uid` argument must a uid with less than or equal to 128 characters.";
    } else if (
      !FirebaseTokenGenerator.isDeveloperClaimsValid_(developerClaims)
    ) {
      errorMessage =
        "`developerClaims` argument must be a valid, non-null object containing the developer claims.";
    }

    if (errorMessage) {
      throw new AuthError(AuthErrorCode.INVALID_ARGUMENT, errorMessage);
    }

    const claims: { [key: string]: any } = {};
    if (typeof developerClaims !== "undefined") {
      for (const key in developerClaims) {
        if (Object.prototype.hasOwnProperty.call(developerClaims, key)) {
          if (BLACKLISTED_CLAIMS.indexOf(key) !== -1) {
            throw new AuthError(
              AuthErrorCode.INVALID_ARGUMENT,
              `Developer claim "${key}" is reserved and cannot be specified.`
            );
          }
          claims[key] = developerClaims[key];
        }
      }
    }
    return this.signer.getAccountId().then(async (account) => {
      const iat = Math.floor(Date.now() / 1000);
      const body: JWTPayload = {
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

      return this.signer.sign(body);
    });
  }

  private static isDeveloperClaimsValid_(developerClaims?: object): boolean {
    if (typeof developerClaims === "undefined") {
      return true;
    }
    return isNonNullObject(developerClaims);
  }
}

export function createFirebaseTokenGenerator(
  credential: ServiceAccountCredential,
  tenantId?: string
): FirebaseTokenGenerator {
  const signer = new ServiceAccountSigner(credential);
  return new FirebaseTokenGenerator(signer, tenantId);
}
