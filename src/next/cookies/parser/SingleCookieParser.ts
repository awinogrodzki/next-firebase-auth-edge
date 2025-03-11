import {errors} from 'jose';
import {ParsedCookies} from '../../../auth/custom-token/index.js';
import {InvalidTokenError, InvalidTokenReason} from '../../../auth/error.js';
import {RotatingCredential} from '../../../auth/rotating-credential.js';
import {CookieParser} from './CookieParser.js';
import {CookiesProvider} from './CookiesProvider.js';

export class SingleCookieParser<Metadata extends object>
  implements CookieParser<Metadata>
{
  constructor(
    private cookies: CookiesProvider,
    private cookieName: string,
    private signatureKeys: string[]
  ) {}

  async parseCookies(): Promise<ParsedCookies<Metadata>> {
    const jwtCookie = this.cookies.get(this.cookieName);

    if (!jwtCookie) {
      throw new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS);
    }

    const credential = new RotatingCredential(this.signatureKeys);

    try {
      const result = await credential.verify(jwtCookie);

      return {
        idToken: result.id_token,
        refreshToken: result.refresh_token,
        customToken: result.custom_token,
        metadata: (result.metadata ?? {}) as Metadata
      };
    } catch (e) {
      if (e instanceof errors.JWSSignatureVerificationFailed) {
        throw new InvalidTokenError(InvalidTokenReason.INVALID_SIGNATURE);
      }

      throw e;
    }
  }
}
