import {ParsedCookies} from '../../../auth/custom-token/index.js';

export interface Cookie {
  name: string;
  value: string;
}

export interface CookieBuilder<Metadata extends object> {
  buildCookies(tokens: ParsedCookies<Metadata>): Promise<Cookie[]>;
}
