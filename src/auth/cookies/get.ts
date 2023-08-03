import { RotatingCredential } from "../rotating-credential";
import { Cookie, SignCookieResult } from "./index";
import { base64url } from "jose";

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
      value: new TextDecoder().decode(base64url.decode(signedCookie.value)),
    };
  };
};
