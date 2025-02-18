import {CookieParserFactory} from '../parser/CookieParserFactory.js';
import {CookiesProvider} from '../parser/CookiesProvider.js';
import {CookieSetter} from '../setter/CookieSetter.js';
import {HeadersCookieSetter} from '../setter/HeadersCookieSetter.js';
import {CombinedCookieExpiration} from './CombinedCookieExpiration.js';
import {MultipleCookieExpiration} from './MultipleCookieExpiration.js';
import {SingleCookieExpiration} from './SingleCookieExpiration.js';

export class CookieExpirationFactory {
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
      return new CombinedCookieExpiration(
        new MultipleCookieExpiration(cookieName, setter),
        new SingleCookieExpiration(cookieName, setter)
      );
    }

    if (hasEnabledMultipleCookies) {
      return new MultipleCookieExpiration(cookieName, setter);
    }

    return new SingleCookieExpiration(cookieName, setter);
  }

  static fromHeaders(
    headers: Headers,
    provider: CookiesProvider,
    cookieName: string
  ) {
    const setter = new HeadersCookieSetter(headers);

    return CookieExpirationFactory.fromSetter(setter, provider, cookieName);
  }
}
