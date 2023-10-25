export const getSignatureCookieName = (name: string) => {
  return `${name}.sig`;
};

export interface Cookie {
  name: string;
  value: string;
}
