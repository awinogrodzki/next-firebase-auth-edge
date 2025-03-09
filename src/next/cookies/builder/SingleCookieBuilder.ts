import {
  CustomJWTPayload,
  ParsedCookies
} from '../../../auth/custom-token/index.js';
import {RotatingCredential} from '../../../auth/rotating-credential.js';
import {Cookie, CookieBuilder} from './CookieBuilder.js';

export class SingleCookieBuilder<Metadata extends object>
  implements CookieBuilder<Metadata>
{
  private credential: RotatingCredential<Metadata>;

  constructor(
    private cookieName: string,
    signatureKeys: string[]
  ) {
    this.credential = new RotatingCredential(signatureKeys);
  }

  public async buildCookies(value: ParsedCookies<Metadata>): Promise<Cookie[]> {
    const payload: CustomJWTPayload<Metadata> = {
      id_token: value.idToken,
      refresh_token: value.refreshToken,
      custom_token: value.customToken
    };

    if (value.metadata && Object.keys(value.metadata).length > 0) {
      payload['metadata'] = value.metadata;
    }

    const jwtToken = await this.credential.sign(payload);

    return [
      {
        name: this.cookieName,
        value: jwtToken
      }
    ];
  }
}
