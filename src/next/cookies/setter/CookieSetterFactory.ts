import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {HeadersCookieSetter} from './HeadersCookieSetter.js';
import {SetAuthCookiesOptions} from '../index.js';
import {RequestCookieSetter} from './RequestCookieSetter.js';

export class CookieSetterFactory {
  static fromRequestCookies(
    cookies: RequestCookies | ReadonlyRequestCookies,
    options: SetAuthCookiesOptions
  ) {
    return new RequestCookieSetter(cookies, options.cookieSerializeOptions);
  }

  static fromHeaders(headers: Headers, options: SetAuthCookiesOptions) {
    return new HeadersCookieSetter(headers, options.cookieSerializeOptions);
  }
}
