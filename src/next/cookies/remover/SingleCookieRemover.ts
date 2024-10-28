import type {CookieSerializeOptions} from 'cookie';
import {Cookie} from '../builder/CookieBuilder.js';
import {CookieSetter} from '../setter/CookieSetter.js';
import {CookieRemover, getExpiredSerializeOptions} from './CookieRemover.js';

export class SingleCookieRemover implements CookieRemover {
  public constructor(
    private cookieName: string,
    private setter: CookieSetter
  ) {}

  removeCookies(options: CookieSerializeOptions): void {
    const cookies: Cookie[] = [
      {
        name: this.cookieName,
        value: ''
      }
    ];

    this.setter.setCookies(cookies, getExpiredSerializeOptions(options));
  }
}
