import { Keygrip } from '../keygrip';
import { Cookie, getSignatureCookieName, SignCookieResult, toBase64 } from './index';

export const sign = (keys: string[]) => {
  const keygrip = new Keygrip(keys);

  return async (cookie: Cookie): Promise<SignCookieResult> => {
    const value = toBase64(cookie.value);
    const hash = await keygrip.sign(value);

    return {
      signedCookie: { name: cookie.name, value },
      signatureCookie: { name: getSignatureCookieName(cookie.name), value: hash }
    };
  };
};
