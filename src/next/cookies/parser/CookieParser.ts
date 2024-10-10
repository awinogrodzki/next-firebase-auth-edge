import {ParsedTokens} from '../../../auth/custom-token/index.js';

export interface CookieParser {
  parseCookies(): Promise<ParsedTokens>;
}
