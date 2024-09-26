import {CustomTokens} from '../../auth/custom-token/index.js';
import {Cookie, CookieBuilder} from './builder/CookieBuilder.js';
import {CookieBuilderFactory} from './builder/CookieBuilderFactory.js';
import {SetAuthCookiesOptions} from './index.js';
import type {ReadonlyRequestCookies} from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {CookieSetterFactory} from './setter/CookieSetterFactory.js';
import type {NextApiResponse} from 'next';
import {NextApiResponseCookieSetter} from './setter/NextApiResponseHeadersCookieSetter.js';

export class AuthCookies {
  private builder: CookieBuilder;
  private cookies: Cookie[] | null = null;

  constructor(private options: SetAuthCookiesOptions) {
    this.builder = CookieBuilderFactory.fromOptions(options);
  }

  private async getCookies(tokens: CustomTokens): Promise<Cookie[]> {
    if (this.cookies) {
      return this.cookies;
    }

    return (this.cookies = await this.builder.buildCookies(tokens));
  }

  public async setAuthCookies(
    tokens: CustomTokens,
    requestCookies: RequestCookies | ReadonlyRequestCookies
  ) {
    const cookies = await this.getCookies(tokens);
    const setter = CookieSetterFactory.fromRequestCookies(
      requestCookies,
      this.options
    );

    setter.setCookies(cookies);
  }

  public async setAuthHeaders(tokens: CustomTokens, headers: Headers) {
    const cookies = await this.getCookies(tokens);
    const setter = CookieSetterFactory.fromHeaders(headers, this.options);

    setter.setCookies(cookies);
  }

  public async setAuthNextApiResponseHeaders(
    tokens: CustomTokens,
    response: NextApiResponse
  ) {
    const cookies = await this.getCookies(tokens);
    const setter = new NextApiResponseCookieSetter(
      response,
      this.options.cookieSerializeOptions
    );

    setter.setCookies(cookies);
  }
}
