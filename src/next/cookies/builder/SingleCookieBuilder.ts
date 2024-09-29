import {CustomTokens} from '../../../auth/custom-token/index.js';
import {RotatingCredential} from '../../../auth/rotating-credential.js';
import {Cookie, CookieBuilder} from './CookieBuilder.js';

export class SingleCookieBuilder implements CookieBuilder {
  private credential: RotatingCredential;

  constructor(
    private cookieName: string,
    signatureKeys: string[]
  ) {
    this.credential = new RotatingCredential(signatureKeys);
  }

  public async buildCookies(tokens: CustomTokens): Promise<Cookie[]> {
    const jwtToken = await this.credential.sign({
      id_token: tokens.idToken,
      refresh_token: tokens.refreshToken,
      custom_token: tokens.customToken
    });

    return [
      {
        name: this.cookieName,
        value: jwtToken
      }
    ];
  }
}
