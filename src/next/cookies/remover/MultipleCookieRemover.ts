import type {CookieSerializeOptions} from 'cookie';
import {Cookie} from '../builder/CookieBuilder.js';
import {CookieSetter} from '../setter/CookieSetter.js';
import {CookieRemover, getExpiredSerializeOptions} from './CookieRemover.js';

export class MultipleCookieRemover implements CookieRemover {
  public constructor(
    private cookieName: string,
    private setter: CookieSetter
  ) {}

  removeCustomCookie(options: CookieSerializeOptions) {
    const cookies: Cookie[] = [
      {
        name: `${this.cookieName}.custom`,
        value: ''
      }
    ];

    this.setter.setCookies(cookies, getExpiredSerializeOptions(options));
  }

  removeCookies(options: CookieSerializeOptions): void {
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
