import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';

export class RequestCookiesProvider {
  static fromHeaders(headers: Headers) {
    const cookies = new RequestCookies(new Headers(headers));

    return new RequestCookiesProvider(cookies);
  }

  static fromRequestCookies(cookies: RequestCookies | ReadonlyRequestCookies) {
    return new RequestCookiesProvider(cookies);
  }

  constructor(private cookies: RequestCookies | ReadonlyRequestCookies) {}

  get(key: string) {
    return this.cookies.get(key)?.value;
  }
}
