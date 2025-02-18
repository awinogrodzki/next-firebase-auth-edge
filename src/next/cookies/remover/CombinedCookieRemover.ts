import {SingleCookieRemover} from './SingleCookieRemover.js';
import {CookieRemover} from './CookieRemover.js';
import {MultipleCookieRemover} from './MultipleCookieRemover.js';

export class CombinedCookieRemover implements CookieRemover {
  constructor(
    private multi: MultipleCookieRemover,
    private single: SingleCookieRemover
  ) {}

  removeCookies(): void {
    this.multi.removeCookies();
    this.single.removeCookies();
  }
}
