import type {CookieSerializeOptions} from 'cookie';
import {Cookie} from '../builder/CookieBuilder.js';
import {CookieSetter} from '../setter/CookieSetter.js';
import {
  CookieExpiration,
  getExpiredSerializeOptions
} from './CookieExpiration.js';

export class MultipleCookieExpiration implements CookieExpiration {
  public constructor(
    private cookieName: string,
    private setter: CookieSetter
  ) {}

  expireCustomCookie(options: CookieSerializeOptions) {
    const cookies: Cookie[] = [
      {
        name: `${this.cookieName}.custom`,
        value: ''
      }
    ];

    this.setter.setCookies(cookies, getExpiredSerializeOptions(options));
  }

  expireCookies(options: CookieSerializeOptions): void {
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

    this.setter.setCookies(cookies, getExpiredSerializeOptions(options));
  }
}
