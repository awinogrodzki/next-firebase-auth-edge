import {ParsedTokens} from '../../../auth/custom-token/index.js';

export interface Cookie {
  name: string;
  value: string;
}

export interface CookieBuilder {
  buildCookies(tokens: ParsedTokens): Promise<Cookie[]>;
}
