import { Keygrip } from '../keygrip';
import { base64ToString, Cookie, SignCookieResult } from './index';

export const get = (keys: string[]) => {
  const keygrip = new Keygrip(keys);

  return async ({ signatureCookie, signedCookie }: SignCookieResult): Promise<Cookie | null> => {
    if (!await keygrip.verify(signedCookie.value, signatureCookie.value)) {
      return null;
    }

    return {
      name: signedCookie.name,
      value: base64ToString(signedCookie.value)
    };
  };
};
