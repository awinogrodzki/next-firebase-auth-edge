import { ServiceAccountCredential } from "../credential";
import { ErrorInfo } from "../error";
import { sign } from "./sign";
import { JWTPayload } from "jose";

export interface CryptoSigner {
  sign(payload: JWTPayload): Promise<string>;
  getAccountId(): Promise<string>;
}

export class ServiceAccountSigner implements CryptoSigner {
  constructor(private readonly credential: ServiceAccountCredential) {
    if (!credential) {
      throw new CryptoSignerError({
        code: CryptoSignerErrorCode.INVALID_CREDENTIAL,
        message:
          "INTERNAL ASSERT: Must provide a service account credential to initialize ServiceAccountSigner.",
      });
    }
  }

  public async sign(payload: JWTPayload): Promise<string> {
    return sign({ payload, privateKey: this.credential.privateKey });
  }

  /**
   * @inheritDoc
   */
  public getAccountId(): Promise<string> {
    return Promise.resolve(this.credential.clientEmail);
  }
}

export interface ExtendedErrorInfo extends ErrorInfo {
  cause?: Error;
}

export class CryptoSignerError extends Error {
  constructor(private errorInfo: ExtendedErrorInfo) {
    super(errorInfo.message);

    Object.setPrototypeOf(this, CryptoSignerError.prototype);
  }

  public get code(): string {
    return this.errorInfo.code;
  }

  public get message(): string {
    return this.errorInfo.message;
  }

  public get cause(): Error | undefined {
    return this.errorInfo.cause;
  }
}

export class CryptoSignerErrorCode {
  public static INVALID_ARGUMENT = "invalid-argument";
  public static INTERNAL_ERROR = "internal-error";
  public static INVALID_CREDENTIAL = "invalid-credential";
  public static SERVER_ERROR = "server-error";
}
