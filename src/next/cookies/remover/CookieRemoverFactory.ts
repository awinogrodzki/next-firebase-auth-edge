import {CookieParserFactory} from '../parser/CookieParserFactory.js';
import {CookiesProvider} from '../parser/CookiesProvider.js';
import {CookieSetter} from '../setter/CookieSetter.js';
import {HeadersCookieSetter} from '../setter/HeadersCookieSetter.js';
import {CombinedCookieRemover} from './CombinedCookieRemover.js';
import {MultipleCookieRemover} from './MultipleCookieRemover.js';
import {SingleCookieRemover} from './SingleCookieRemover.js';

export class CookieRemoverFactory {
  private static fromSetter(
    setter: CookieSetter,
    provider: CookiesProvider,
    cookieName: string
  ) {
    const singleCookie = provider.get(cookieName);
    const hasEnabledMultipleCookies = CookieParserFactory.hasMultipleCookies(
      provider,
      cookieName
    );
    const hasEnabledLegacyMultipleCookies =
      CookieParserFactory.hasLegacyMultipleCookies(provider, cookieName);

    if (
      singleCookie &&
      (hasEnabledMultipleCookies || hasEnabledLegacyMultipleCookies)
    ) {
      return new CombinedCookieRemover(
        new MultipleCookieRemover(cookieName, setter),
        new SingleCookieRemover(cookieName, setter)
      );
    }

    if (hasEnabledMultipleCookies) {
      return new MultipleCookieRemover(cookieName, setter);
    }

    return new SingleCookieRemover(cookieName, setter);
  }

  static fromHeaders(
    headers: Headers,
    provider: CookiesProvider,
    cookieName: string
  ) {
    const setter = new HeadersCookieSetter(headers);

    return CookieRemoverFactory.fromSetter(setter, provider, cookieName);
  }
}
