import {errors} from 'jose';
import {ParsedTokens} from '../../../auth/custom-token/index.js';
import {InvalidTokenError, InvalidTokenReason} from '../../../auth/error.js';
import {RotatingCredential} from '../../../auth/rotating-credential.js';
import {CookieParser} from './CookieParser.js';
import {CookiesProvider} from './CookiesProvider.js';

export class MultipleCookiesParser implements CookieParser {
  constructor(
    private cookies: CookiesProvider,
    private cookieName: string,
    private signatureKeys: string[]
  ) {}

  async parseCookies(): Promise<ParsedTokens> {
    const idTokenCookie = this.cookies.get(`${this.cookieName}.id`);
    const refreshTokenCookie = this.cookies.get(`${this.cookieName}.refresh`);
    const customTokenCookie = this.cookies.get(`${this.cookieName}.custom`);
    const signatureCookie = this.cookies.get(`${this.cookieName}.sig`);

    if (![idTokenCookie, refreshTokenCookie, signatureCookie].every(Boolean)) {
      throw new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS);
    }

    const signature = signatureCookie!;
    const customTokens: ParsedTokens = {
      idToken: idTokenCookie!,
      refreshToken: refreshTokenCookie!,
      customToken: customTokenCookie
    };

    const credential = new RotatingCredential(this.signatureKeys);

    try {
      await credential.verifySignature(customTokens, signature);

      return customTokens;
    } catch (e) {
      if (e instanceof errors.JWSSignatureVerificationFailed) {
        throw new InvalidTokenError(InvalidTokenReason.INVALID_SIGNATURE);
      }

      throw e;
    }
  }
}
