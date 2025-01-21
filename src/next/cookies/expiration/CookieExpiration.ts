import type {CookieSerializeOptions} from 'cookie';

export interface CookieExpiration {
  expireCookies(options: CookieSerializeOptions): void;
}

export function getExpiredSerializeOptions(options: CookieSerializeOptions) {
  const cookieOptions = {
    ...options,
    expires: new Date(0)
  };
  delete cookieOptions['maxAge'];

  return cookieOptions;
}
