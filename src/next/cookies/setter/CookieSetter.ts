import {Cookie} from '../builder/CookieBuilder.js';

export interface CookieSetter {
  setCookies(cookies: Cookie[]): void;
}
