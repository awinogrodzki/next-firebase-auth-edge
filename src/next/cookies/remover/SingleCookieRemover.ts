import {Cookie} from '../builder/CookieBuilder.js';
import {RemoveAuthCookiesOptions} from '../index.js';
import {CookieSetter} from '../setter/CookieSetter.js';
import {HeadersCookieSetter} from '../setter/HeadersCookieSetter.js';
import {CookieRemover, getExpiredSerializeOptions} from './CookieRemover.js';

export class SingleCookieRemover implements CookieRemover {
  static fromHeaders(
    headers: Headers,
    options: RemoveAuthCookiesOptions
  ): CookieRemover {
    const setter = new HeadersCookieSetter(
      headers,
      getExpiredSerializeOptions(options.cookieSerializeOptions)
    );

    return new SingleCookieRemover(options.cookieName, setter);
  }
  private constructor(
    private cookieName: string,
    private setter: CookieSetter
  ) {}

  removeCookies(): void {
    const cookies: Cookie[] = [
      {
        name: this.cookieName,
        value: ''
      }
    ];

    this.setter.setCookies(cookies);
  }
}
