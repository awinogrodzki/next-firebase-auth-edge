import {CustomTokens} from '../../../auth/custom-token/index.js';

export interface CookieParser {
  parseCookies(): Promise<CustomTokens>;
}
