import {SetAuthCookiesOptions} from '../types.js';
import {MultipleCookieBuilder} from './MultipleCookieBuilder.js';
import {SingleCookieBuilder} from './SingleCookieBuilder.js';

export class CookieBuilderFactory {
  static fromOptions(options: SetAuthCookiesOptions) {
    if (options.enableMultipleCookies) {
      return new MultipleCookieBuilder(
        options.cookieName,
        options.cookieSignatureKeys
      );
    }

    return new SingleCookieBuilder(
      options.cookieName,
      options.cookieSignatureKeys
    );
  }
}
