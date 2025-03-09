import type {CookieSerializeOptions} from 'cookie';
import {ServiceAccount} from '../../auth/credential.js';
import {Tokens} from '../../auth/types.js';

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
  getMetadata?: (tokens: Tokens) => Promise<Metadata>;
}

export type CookiesObject = Partial<{[K in string]: string}>;

export interface GetCookiesTokensOptions {
  cookieName: string;
  cookieSignatureKeys: string[];
}
