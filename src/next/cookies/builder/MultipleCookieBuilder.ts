import {base64url} from 'jose';
import {ParsedCookies} from '../../../auth/custom-token/index.js';
import {RotatingCredential} from '../../../auth/rotating-credential.js';
import {Cookie, CookieBuilder} from './CookieBuilder.js';

export class MultipleCookieBuilder<Metadata extends object>
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
    const signature = await this.credential.createSignature(value);

    const result: Cookie[] = [
      {
        name: `${this.cookieName}.id`,
        value: value.idToken
      },
      {
        name: `${this.cookieName}.refresh`,
        value: value.refreshToken
      }
    ];

    if (value.customToken) {
      result.push({
        name: `${this.cookieName}.custom`,
        value: value.customToken
      });
    }

    if (value.metadata && Object.keys(value.metadata).length > 0) {
      result.push({
        name: `${this.cookieName}.metadata`,
        value: base64url.encode(JSON.stringify(value.metadata))
      });
    }

    result.push({
      name: `${this.cookieName}.sig`,
      value: signature
    });

    return result;
  }
}
