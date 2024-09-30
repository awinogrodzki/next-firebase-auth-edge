import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {InvalidTokenError, InvalidTokenReason} from '../../../auth/error.js';
import {debug} from '../../../debug/index.js';
import {GetCookiesTokensOptions} from '../types.js';
import {CookiesObject} from '../types.js';
import {CookiesProvider} from './CookiesProvider.js';
import {MultipleCookiesParser} from './MultipleCookiesParser.js';
import {ObjectCookiesProvider} from './ObjectCookiesProvider.js';
import {RequestCookiesProvider} from './RequestCookiesProvider.js';
import {SingleCookieParser} from './SingleCookieParser.js';

export class CookieParserFactory {
  public static hasMultipleCookies(
    provider: CookiesProvider,
    cookieName: string
  ) {
    return ['id', 'refresh', 'custom', 'sig']
      .map((it) => `${cookieName}.${it}`)
      .every((it) => Boolean(provider.get(it)));
  }

  public static hasLegacyMultipleCookies(
    provider: CookiesProvider,
    cookieName: string
  ) {
    return (
      ['custom', 'sig']
        .map((it) => `${cookieName}.${it}`)
        .every((it) => Boolean(provider.get(it))) &&
      provider.get(cookieName)?.includes(':')
    );
  }

  private static getCompatibleProvider(
    legacyProvider: CookiesProvider,
    options: GetCookiesTokensOptions
  ) {
    const legacyToken = legacyProvider.get(options.cookieName);
    const [idToken, refreshToken] = legacyToken?.split(':') ?? [];

    const adaptedCookies = {
      [`${options.cookieName}.id`]: idToken,
      [`${options.cookieName}.refresh`]: refreshToken,
      [`${options.cookieName}.custom`]: legacyProvider.get(
        `${options.cookieName}.custom`
      ),
      [`${options.cookieName}.sig`]: legacyProvider.get(
        `${options.cookieName}.sig`
      )
    };

    return new ObjectCookiesProvider(adaptedCookies);
  }

  private static fromProvider(
    provider: CookiesProvider,
    options: GetCookiesTokensOptions
  ) {
    const singleCookie = provider.get(options.cookieName);
    const hasLegacyCookie = singleCookie?.includes(':');
    const enableMultipleCookies = CookieParserFactory.hasMultipleCookies(
      provider,
      options.cookieName
    );

    if (enableMultipleCookies) {
      return new MultipleCookiesParser(
        provider,
        options.cookieName,
        options.cookieSignatureKeys
      );
    }

    if (
      CookieParserFactory.hasLegacyMultipleCookies(provider, options.cookieName)
    ) {
      return new MultipleCookiesParser(
        CookieParserFactory.getCompatibleProvider(provider, options),
        options.cookieName,
        options.cookieSignatureKeys
      );
    }

    if (!enableMultipleCookies && hasLegacyCookie) {
      debug(
        "Authentication cookie is in multiple cookie format, but lacks signature and custom cookies. Clear your browser cookies and try again. If the issue keeps happening and you're using `enableMultipleCookies` option, make sure that server returns all required cookies: https://next-firebase-auth-edge-docs.vercel.app/docs/usage/middleware#multiple-cookies"
      );

      throw new InvalidTokenError(InvalidTokenReason.INVALID_CREDENTIALS);
    }

    return new SingleCookieParser(
      provider,
      options.cookieName,
      options.cookieSignatureKeys
    );
  }

  static fromRequestCookies(
    cookies: RequestCookies | ReadonlyRequestCookies,
    options: GetCookiesTokensOptions
  ) {
    const provider = new RequestCookiesProvider(cookies);

    return CookieParserFactory.fromProvider(provider, options);
  }

  static fromObject(cookies: CookiesObject, options: GetCookiesTokensOptions) {
    const provider = new ObjectCookiesProvider(cookies);

    return CookieParserFactory.fromProvider(provider, options);
  }
}
