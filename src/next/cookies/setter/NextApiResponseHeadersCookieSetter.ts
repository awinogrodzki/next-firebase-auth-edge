import {CookieSerializeOptions, serialize} from 'cookie';
import type {NextApiResponse} from 'next';
import type {Cookie} from '../builder/CookieBuilder.js';
import type {CookieSetter} from './CookieSetter.js';

export class NextApiResponseCookieSetter implements CookieSetter {
  constructor(private response: NextApiResponse) {}

  setCookies(cookies: Cookie[], options: CookieSerializeOptions): void {
    for (const cookie of cookies) {
      this.response.setHeader('Set-Cookie', [
        serialize(cookie.name, cookie.value, options)
      ]);
    }
  }
}
