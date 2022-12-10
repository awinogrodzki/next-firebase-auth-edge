import { RotatingCredential } from "../rotating-credential";
import {
  Cookie,
  getSignatureCookieName,
  SignCookieResult,
  toBase64,
} from "./index";

export const sign = (keys: string[]) => {
  const credential = new RotatingCredential(keys);

  return async (cookie: Cookie): Promise<SignCookieResult> => {
    const value = toBase64(cookie.value);
    const hash = await credential.sign(value);

    return {
      signedCookie: { name: cookie.name, value },
      signatureCookie: {
        name: getSignatureCookieName(cookie.name),
        value: hash,
      },
    };
  };
};
