import type {CookieSerializeOptions} from 'cookie';
import {ServiceAccount} from '../../auth/credential.js';
import {TokenSet} from '../../auth/types.js';

export interface SetAuthCookiesOptions<Metadata extends object> {
  cookieName: string;
  cookieSignatureKeys: string[];
  cookieSerializeOptions: CookieSerializeOptions;
  enableMultipleCookies?: boolean;
  enableCustomToken?: boolean;
  serviceAccount?: ServiceAccount;
  apiKey: string;
  tenantId?: string;
  authorizationHeaderName?: string;
  dynamicCustomClaimsKeys?: string[];
  getMetadata?: (tokens: TokenSet) => Promise<Metadata>;
}

export type CookiesObject = Partial<{[K in string]: string}>;

export interface GetCookiesTokensOptions {
  cookieName: string;
  cookieSignatureKeys: string[];
}
