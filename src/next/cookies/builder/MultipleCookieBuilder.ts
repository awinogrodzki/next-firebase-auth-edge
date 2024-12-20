import {ParsedTokens} from '../../../auth/custom-token/index.js';
import {RotatingCredential} from '../../../auth/rotating-credential.js';
import {Cookie, CookieBuilder} from './CookieBuilder.js';

export class MultipleCookieBuilder implements CookieBuilder {
  private credential: RotatingCredential;

  constructor(
    private cookieName: string,
    signatureKeys: string[]
  ) {
    this.credential = new RotatingCredential(signatureKeys);
  }

  public async buildCookies(tokens: ParsedTokens): Promise<Cookie[]> {
    const signature = await this.credential.createSignature(tokens);

    if (!tokens.customToken) {
      return [
        {
          name: `${this.cookieName}.id`,
          value: tokens.idToken
        },
        {
          name: `${this.cookieName}.refresh`,
          value: tokens.refreshToken
        },
        {
          name: `${this.cookieName}.sig`,
          value: signature
        }
      ];
    }

    return [
      {
        name: `${this.cookieName}.id`,
        value: tokens.idToken
      },
      {
        name: `${this.cookieName}.refresh`,
        value: tokens.refreshToken
      },
      {
        name: `${this.cookieName}.custom`,
        value: tokens.customToken
      },
      {
        name: `${this.cookieName}.sig`,
        value: signature
      }
    ];
  }
}
