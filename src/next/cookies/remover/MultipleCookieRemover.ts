import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import {CookieRemover} from './CookieRemover.js';

export class MultipleCookieRemover implements CookieRemover {
  public constructor(
    private cookieName: string,
    private cookies: RequestCookies | ReadonlyRequestCookies
  ) {}

  removeCookies(): void {
    [
      `${this.cookieName}.id`,
      `${this.cookieName}.refresh`,
      `${this.cookieName}.custom`,
      `${this.cookieName}.sig`
    ].forEach((name) => this.cookies.delete(name));
  }
}
