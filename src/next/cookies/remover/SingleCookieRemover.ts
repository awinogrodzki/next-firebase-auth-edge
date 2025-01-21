import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import {CookieRemover} from './CookieRemover.js';

export class SingleCookieRemover implements CookieRemover {
  public constructor(
    private cookieName: string,
    private cookies: RequestCookies | ReadonlyRequestCookies
  ) {}

  removeCookies(): void {
    this.cookies.delete(this.cookieName);
  }
}
