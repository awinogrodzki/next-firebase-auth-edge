import {CookieParserFactory} from '../parser/CookieParserFactory.js';
import {CookiesProvider} from '../parser/CookiesProvider.js';
import {CombinedCookieRemover} from './CombinedCookieRemover';
import {MultipleCookieRemover} from './MultipleCookieRemover';
import {SingleCookieRemover} from './SingleCookieRemover';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export class CookieRemoverFactory {
  static fromRequestCookies(
    cookies: RequestCookies | ReadonlyRequestCookies,
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
        new MultipleCookieRemover(cookieName, cookies),
        new SingleCookieRemover(cookieName, cookies)
      );
    }

    if (hasEnabledMultipleCookies) {
      return new MultipleCookieRemover(cookieName, cookies);
    }

    return new SingleCookieRemover(cookieName, cookies);
  }
}
