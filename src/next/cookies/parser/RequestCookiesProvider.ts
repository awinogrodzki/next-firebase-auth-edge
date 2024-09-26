import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';

export class RequestCookiesProvider {
  constructor(private cookies: RequestCookies | ReadonlyRequestCookies) {}

  get(key: string) {
    return this.cookies.get(key)?.value;
  }
}
