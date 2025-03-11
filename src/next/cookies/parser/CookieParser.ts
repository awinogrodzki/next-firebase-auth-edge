import {ParsedCookies} from '../../../auth/custom-token/index.js';

export interface CookieParser<Metadata extends object> {
  parseCookies(): Promise<ParsedCookies<Metadata>>;
}
