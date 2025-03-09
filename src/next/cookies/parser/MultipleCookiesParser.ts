import {base64url, errors} from 'jose';
import {ParsedCookies} from '../../../auth/custom-token/index.js';
import {InvalidTokenError, InvalidTokenReason} from '../../../auth/error.js';
import {RotatingCredential} from '../../../auth/rotating-credential.js';
import {CookieParser} from './CookieParser.js';
import {CookiesProvider} from './CookiesProvider.js';

const textDecoder = new TextDecoder();

export class MultipleCookiesParser<Metadata extends object>
  implements CookieParser<Metadata>
{
  constructor(
    private cookies: CookiesProvider,
    private cookieName: string,
    private signatureKeys: string[]
  ) {}

  async parseCookies(): Promise<ParsedCookies<Metadata>> {
    const idTokenCookie = this.cookies.get(`${this.cookieName}.id`);
    const refreshTokenCookie = this.cookies.get(`${this.cookieName}.refresh`);
    const customTokenCookie = this.cookies.get(`${this.cookieName}.custom`);
    const metadataCookie = this.cookies.get(`${this.cookieName}.metadata`);
    const signatureCookie = this.cookies.get(`${this.cookieName}.sig`);

    if (![idTokenCookie, refreshTokenCookie, signatureCookie].every(Boolean)) {
      throw new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS);
    }

    const signature = signatureCookie!;
    const customTokens: ParsedCookies<Metadata> = {
      idToken: idTokenCookie!,
      refreshToken: refreshTokenCookie!,
      customToken: customTokenCookie,
      metadata: metadataCookie
        ? JSON.parse(textDecoder.decode(base64url.decode(metadataCookie)))
        : {}
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
