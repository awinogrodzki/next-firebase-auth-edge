import { Keygrip } from './keygrip';

interface Cookie {
  name: string;
  value: string;
}

interface SignCookieResult {
  signedCookie: Cookie;
  signatureCookie: Cookie;
}


export const toBase64 = (value: string) => {
  return btoa(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

export const base64ToString = (value: string) => {
  return atob(value);
};

export const getSignatureCookieName = (name: string) => {
  return `${name}.sig`;
};

export const cookieSigner = (keys: string[]) => {
  const keygrip = new Keygrip(keys);

  const sign = async (cookie: Cookie): Promise<SignCookieResult> => {
    const value = toBase64(cookie.value);
    const hash = await keygrip.sign(value);

    return {
      signedCookie: { name: cookie.name, value },
      signatureCookie: { name: getSignatureCookieName(cookie.name), value: hash }
    };
  };

  const get = async ({ signatureCookie, signedCookie }: SignCookieResult): Promise<Cookie | null> => {
    if (!await keygrip.verify(signedCookie.value, signatureCookie.value)) {
      return null;
    }

    return {
      name: signedCookie.name,
      value: base64ToString(signatureCookie.value)
    };
  };

  return {
    getSignatureCookieName, sign, get
  };
};
