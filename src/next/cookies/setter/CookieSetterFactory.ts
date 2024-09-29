import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {HeadersCookieSetter} from './HeadersCookieSetter.js';
import {RequestCookieSetter} from './RequestCookieSetter.js';

export class CookieSetterFactory {
  static fromRequestCookies(cookies: RequestCookies | ReadonlyRequestCookies) {
    return new RequestCookieSetter(cookies);
  }

  static fromHeaders(headers: Headers) {
    return new HeadersCookieSetter(headers);
  }
}
