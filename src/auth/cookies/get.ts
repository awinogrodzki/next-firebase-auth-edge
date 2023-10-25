import { RotatingCredential } from "../rotating-credential";
import { Cookie } from "./index";
import { base64url } from "jose";
import { SignedCookies } from "./sign";

export const get = (keys: string[]) => {
  const credential = new RotatingCredential(keys);

  return async ({
    signature,
    signed,
  }: SignedCookies): Promise<Cookie | null> => {
    if (!(await credential.verify(signed.value, signature.value))) {
      return null;
    }

    return {
      name: signed.name,
      value: new TextDecoder().decode(base64url.decode(signed.value)),
    };
  };
};
