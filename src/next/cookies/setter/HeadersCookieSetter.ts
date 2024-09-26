import {CookieSerializeOptions, serialize} from 'cookie';
import type {Cookie} from '../builder/CookieBuilder.js';
import type {CookieSetter} from './CookieSetter.js';

export class HeadersCookieSetter implements CookieSetter {
  constructor(
    private headers: Headers,
    private options: CookieSerializeOptions
  ) {}

  setCookies(cookies: Cookie[]): void {
    for (const cookie of cookies) {
      this.headers.append(
        'Set-Cookie',
        serialize(cookie.name, cookie.value, this.options)
      );
    }
  }
}
