import {CookieSerializeOptions} from 'cookie';
import type {Cookie} from '../builder/CookieBuilder.js';

export interface CookieSetter {
  setCookies(cookies: Cookie[], options: CookieSerializeOptions): void;
}
