import { RotatingCredential } from "../rotating-credential";
import { base64ToString, Cookie, SignCookieResult } from "./index";

export const get = (keys: string[]) => {
  const credential = new RotatingCredential(keys);

  return async ({
    signatureCookie,
    signedCookie,
  }: SignCookieResult): Promise<Cookie | null> => {
    if (!(await credential.verify(signedCookie.value, signatureCookie.value))) {
      return null;
    }

    return {
      name: signedCookie.name,
      value: base64ToString(signedCookie.value),
    };
  };
};
