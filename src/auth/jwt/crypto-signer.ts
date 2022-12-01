import { ServiceAccountCredential } from '../credential';
import { ErrorInfo } from '../error';
import { ALGORITHMS } from './consts';
import { arrayBufferToBase64, pemToArrayBuffer, stringToArrayBuffer } from './utils';

const ALGORITHM_RS256 = 'RS256' as const;

export interface CryptoSigner {
  readonly algorithm: 'RS256' | 'none';

  sign(token: string): Promise<string>;
  getAccountId(): Promise<string>;
}

export class ServiceAccountSigner implements CryptoSigner {
  algorithm = ALGORITHM_RS256;

  constructor(private readonly credential: ServiceAccountCredential) {
    if (!credential) {
      throw new CryptoSignerError({
        code: CryptoSignerErrorCode.INVALID_CREDENTIAL,
        message: 'INTERNAL ASSERT: Must provide a service account credential to initialize ServiceAccountSigner.',
      });
    }
  }


  public async sign(token: string): Promise<string> {
    const tokenBuffer = stringToArrayBuffer(token);
    const keyData = pemToArrayBuffer(this.credential.privateKey);
    const key = await crypto.subtle.importKey(
      'pkcs8',
      keyData,
      ALGORITHMS[ALGORITHM_RS256],
      false,
      ['sign']
    );

    const signed = await crypto.subtle.sign(ALGORITHMS[ALGORITHM_RS256], key, tokenBuffer);
    return arrayBufferToBase64(signed);
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
  public static INVALID_ARGUMENT = 'invalid-argument';
  public static INTERNAL_ERROR = 'internal-error';
  public static INVALID_CREDENTIAL = 'invalid-credential';
  public static SERVER_ERROR = 'server-error';
}
