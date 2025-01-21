import type {NextApiResponse} from 'next';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {ParsedTokens} from '../../auth/custom-token/index.js';
import {Cookie, CookieBuilder} from './builder/CookieBuilder.js';
import {CookieBuilderFactory} from './builder/CookieBuilderFactory.js';
import {CookieParserFactory} from './parser/CookieParserFactory.js';
import {CookiesProvider} from './parser/CookiesProvider.js';
import {MultipleCookieRemover} from './remover/MultipleCookieRemover.js';
import {SingleCookieRemover} from './remover/SingleCookieRemover.js';
import {CookieSetter} from './setter/CookieSetter.js';
import {CookieSetterFactory} from './setter/CookieSetterFactory.js';
import {NextApiResponseCookieSetter} from './setter/NextApiResponseHeadersCookieSetter.js';
import {SetAuthCookiesOptions} from './types.js';

export class AuthCookies {
  private builder: CookieBuilder;
  private targetCookies: Cookie[] | null = null;

  constructor(
    private provider: CookiesProvider,
    private options: SetAuthCookiesOptions
  ) {
    this.builder = CookieBuilderFactory.fromOptions(options);
  }

  private shouldClearMultipleCookies() {
    return (
      !this.options.enableMultipleCookies &&
      (CookieParserFactory.hasMultipleCookies(
        this.provider,
        this.options.cookieName
      ) ||
        CookieParserFactory.hasLegacyMultipleCookies(
          this.provider,
          this.options.cookieName
        ))
    );
  }

  private shouldClearCustomTokenCookie() {
    return (
      !this.options.enableCustomToken &&
      CookieParserFactory.hasCustomTokenCookie(
        this.provider,
        this.options.cookieName
      )
    );
  }

  private shouldClearSingleCookie() {
    const hasSingleCookie = Boolean(this.provider.get(this.options.cookieName));

    return this.options.enableMultipleCookies && hasSingleCookie;
  }

  private clearUnusedCookies(setter: CookieSetter) {
    if (this.shouldClearMultipleCookies()) {
      const remover = new MultipleCookieRemover(
        this.options.cookieName,
        setter
      );

      remover.expireCookies(this.options.cookieSerializeOptions);
    } else if (this.shouldClearCustomTokenCookie()) {
      const remover = new MultipleCookieRemover(
        this.options.cookieName,
        setter
      );

      remover.expireCustomCookie(this.options.cookieSerializeOptions);
    }

    if (this.shouldClearSingleCookie()) {
      const remover = new SingleCookieRemover(this.options.cookieName, setter);

      remover.expireCookies(this.options.cookieSerializeOptions);
    }
  }

  private async getCookies(tokens: ParsedTokens): Promise<Cookie[]> {
    const tokensToSave = this.options.enableCustomToken
      ? tokens
      : {idToken: tokens.idToken, refreshToken: tokens.refreshToken};

    if (this.targetCookies) {
      return this.targetCookies;
    }

    return (this.targetCookies = await this.builder.buildCookies(tokensToSave));
  }

  public async setAuthCookies(
    tokens: ParsedTokens,
    requestCookies: RequestCookies | ReadonlyRequestCookies
  ) {
    const cookies = await this.getCookies(tokens);
    const setter = CookieSetterFactory.fromRequestCookies(requestCookies);

    this.clearUnusedCookies(setter);
    setter.setCookies(cookies, this.options.cookieSerializeOptions);
  }

  public async setAuthHeaders(tokens: ParsedTokens, headers: Headers) {
    const cookies = await this.getCookies(tokens);
    const setter = CookieSetterFactory.fromHeaders(headers);

    this.clearUnusedCookies(setter);
    setter.setCookies(cookies, this.options.cookieSerializeOptions);
  }

  public async setAuthNextApiResponseHeaders(
    tokens: ParsedTokens,
    response: NextApiResponse
  ) {
    const cookies = await this.getCookies(tokens);
    const setter = new NextApiResponseCookieSetter(response);

    this.clearUnusedCookies(setter);
    setter.setCookies(cookies, this.options.cookieSerializeOptions);
  }
}
