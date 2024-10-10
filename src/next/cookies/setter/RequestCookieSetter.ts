import type {CookieSerializeOptions} from 'cookie';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import type {Cookie} from '../builder/CookieBuilder.js';
import type {CookieSetter} from './CookieSetter.js';

export class RequestCookieSetter implements CookieSetter {
  constructor(private cookies: RequestCookies | ReadonlyRequestCookies) {}

  setCookies(cookies: Cookie[], options: CookieSerializeOptions): void {
    for (const cookie of cookies) {
      if (cookie.value) {
        this.cookies.set(cookie.name, cookie.value, options);
      } else {
        this.cookies.delete(cookie.name);
      }
    }
  }
}
