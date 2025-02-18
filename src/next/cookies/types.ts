import type {CookieSerializeOptions} from 'cookie';
import {ServiceAccount} from '../../auth/credential.js';

export interface SetAuthCookiesOptions {
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
}

export type CookiesObject = Partial<{[K in string]: string}>;

export interface GetCookiesTokensOptions {
  cookieName: string;
  cookieSignatureKeys: string[];
}
