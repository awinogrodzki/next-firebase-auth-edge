import {RemoveAuthCookiesOptions} from '../index.js';
import {CookieParserFactory} from '../parser/CookieParserFactory.js';
import {RequestCookiesProvider} from '../parser/RequestCookiesProvider.js';
import {CombinedCookieRemover} from './CombinedCookieRemover.js';
import {MultipleCookieRemover} from './MultipleCookieRemover.js';
import {SingleCookieRemover} from './SingleCookieRemover.js';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';

export class CookieRemoverFactory {
  static fromHeaders(
    headers: Headers,
    cookies: RequestCookies | ReadonlyRequestCookies,
    options: RemoveAuthCookiesOptions
  ) {
    const provider = new RequestCookiesProvider(cookies);
    const singleCookie = provider.get(options.cookieName);
    const hasEnabledMultipleCookies = CookieParserFactory.hasMultipleCookies(
      provider,
      options.cookieName
    );
    const hasEnabledLegacyMultipleCookies =
      CookieParserFactory.hasLegacyMultipleCookies(
        provider,
        options.cookieName
      );

    if (
      singleCookie &&
      (hasEnabledMultipleCookies || hasEnabledLegacyMultipleCookies)
    ) {
      return CombinedCookieRemover.fromHeaders(headers, options);
    }

    if (hasEnabledMultipleCookies) {
      return MultipleCookieRemover.fromHeaders(headers, options);
    }

    return SingleCookieRemover.fromHeaders(headers, options);
  }
}
