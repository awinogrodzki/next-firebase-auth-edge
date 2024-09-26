import {RemoveAuthCookiesOptions} from '../index.js';
import {MultipleCookieRemover} from './MultipleCookieRemover.js';
import {SingleCookieRemover} from './SingleCookieRemover.js';

export class CookieRemoverFactory {
  static fromHeaders(headers: Headers, options: RemoveAuthCookiesOptions) {
    if (options.enableMultipleCookies) {
      return MultipleCookieRemover.fromHeaders(headers, options);
    }

    return SingleCookieRemover.fromHeaders(headers, options);
  }
}
