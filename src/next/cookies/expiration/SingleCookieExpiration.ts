import type {CookieSerializeOptions} from 'cookie';
import {Cookie} from '../builder/CookieBuilder.js';
import {CookieSetter} from '../setter/CookieSetter.js';
import {
  CookieExpiration,
  getExpiredSerializeOptions
} from './CookieExpiration.js';

export class SingleCookieExpiration implements CookieExpiration {
  public constructor(
    private cookieName: string,
    private setter: CookieSetter
  ) {}

  expireCookies(options: CookieSerializeOptions): void {
    const cookies: Cookie[] = [
      {
        name: this.cookieName,
        value: ''
      }
    ];

    this.setter.setCookies(cookies, getExpiredSerializeOptions(options));
  }
}
