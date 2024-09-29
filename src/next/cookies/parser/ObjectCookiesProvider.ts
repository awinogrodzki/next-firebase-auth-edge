export class ObjectCookiesProvider {
  constructor(private cookies: Partial<{[K in string]: string}>) {}

  get(key: string) {
    return this.cookies[key];
  }
}
