import { RotatingCredential } from "../rotating-credential";
import { Cookie, getSignatureCookieName, SignCookieResult } from "./index";
import { base64url } from "jose";

export const sign = (keys: string[]) => {
  const credential = new RotatingCredential(keys);

  return async (cookie: Cookie): Promise<SignCookieResult> => {
    const value = base64url.encode(cookie.value);
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
