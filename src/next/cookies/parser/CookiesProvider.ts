export interface CookiesProvider {
  get(key: string): string | undefined;
}
