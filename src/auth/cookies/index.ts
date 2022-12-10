export const toBase64 = (value: string) => {
  return btoa(value).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

export const base64ToString = (value: string) => {
  return atob(value);
};

export const getSignatureCookieName = (name: string) => {
  return `${name}.sig`;
};

export interface Cookie {
  name: string;
  value: string;
}

export interface SignCookieResult {
  signedCookie: Cookie;
  signatureCookie: Cookie;
}
