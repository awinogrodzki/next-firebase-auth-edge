import {RemoveAuthCookiesOptions} from '../index.js';
import {CookieRemover} from './CookieRemover.js';
import {MultipleCookieRemover} from './MultipleCookieRemover.js';
import {SingleCookieRemover} from './SingleCookieRemover.js';

export class CombinedCookieRemover implements CookieRemover {
  static fromHeaders(
    headers: Headers,
    options: RemoveAuthCookiesOptions
  ): CookieRemover {
    const multiRemover = MultipleCookieRemover.fromHeaders(headers, options);
    const singleCookieRemover = SingleCookieRemover.fromHeaders(
      headers,
      options
    );

    return new CombinedCookieRemover(multiRemover, singleCookieRemover);
  }

  private constructor(
    private multiRemover: MultipleCookieRemover,
    private singleRemover: SingleCookieRemover
  ) {}

  removeCookies(): void {
    this.singleRemover.removeCookies();
    this.multiRemover.removeCookies();
  }
}
