import {RotatingCredential} from '../rotating-credential';
import {Cookie, getSignatureCookieName} from './index';
import {base64url} from 'jose';

export interface SignedCookies {
  signature: Cookie;
  signed: Cookie;
}

export const sign = (keys: string[]) => {
  const credential = new RotatingCredential(keys);

  return async (cookie: Cookie): Promise<SignedCookies> => {
    const value = base64url.encode(cookie.value);
    const hash = await credential.sign(value);

    return {
      signature: {name: cookie.name, value},
      signed: {
        name: getSignatureCookieName(cookie.name),
        value: hash
      }
    };
  };
};
