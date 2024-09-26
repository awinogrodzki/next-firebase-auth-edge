import type {CookieSerializeOptions} from 'cookie';
import type {Cookie} from '../builder/CookieBuilder.js';
import type {CookieSetter} from './CookieSetter.js';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';

export class RequestCookieSetter implements CookieSetter {
  constructor(
    private cookies: RequestCookies | ReadonlyRequestCookies,
    private options: CookieSerializeOptions
  ) {}

  setCookies(cookies: Cookie[]): void {
    for (const cookie of cookies) {
      this.cookies.set(cookie.name, cookie.value, this.options);
    }
  }
}
