import type {CookieSerializeOptions} from 'cookie';
import {CookieExpiration} from './CookieExpiration.js';
import {MultipleCookieExpiration} from './MultipleCookieExpiration.js';
import {SingleCookieExpiration} from './SingleCookieExpiration.js';

export class CombinedCookieExpiration implements CookieExpiration {
  constructor(
    private multi: MultipleCookieExpiration,
    private single: SingleCookieExpiration
  ) {}

  expireCookies(options: CookieSerializeOptions): void {
    this.multi.expireCookies(options);
    this.single.expireCookies(options);
  }
}
