import {CookiesObject} from '../index.js';

export class ObjectCookiesProvider {
  constructor(private cookies: CookiesObject) {}

  get(key: string) {
    return this.cookies[key];
  }
}
