import {Cookie} from '../builder/CookieBuilder.js';
import {RemoveAuthCookiesOptions} from '../index.js';
import {CookieSetter} from '../setter/CookieSetter.js';
import {HeadersCookieSetter} from '../setter/HeadersCookieSetter.js';
import {CookieRemover, getExpiredSerializeOptions} from './CookieRemover.js';

export class MultipleCookieRemover implements CookieRemover {
  static fromHeaders(
    headers: Headers,
    options: RemoveAuthCookiesOptions
  ): MultipleCookieRemover {
    const setter = new HeadersCookieSetter(
      headers,
      getExpiredSerializeOptions(options.cookieSerializeOptions)
    );

    return new MultipleCookieRemover(options.cookieName, setter);
  }
  private constructor(
    private cookieName: string,
    private setter: CookieSetter
  ) {}

  removeCookies(): void {
    const cookies: Cookie[] = [
      {
        name: `${this.cookieName}.id`,
        value: ''
      },
      {
        name: `${this.cookieName}.refresh`,
        value: ''
      },
      {
        name: `${this.cookieName}.custom`,
        value: ''
      },
      {
        name: `${this.cookieName}.sig`,
        value: ''
      }
    ];

    this.setter.setCookies(cookies);
  }
}
