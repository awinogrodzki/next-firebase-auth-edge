import {CookiesObject} from '../types.js';

export class ObjectCookiesProvider {
  constructor(private cookies: CookiesObject) {}

  get(key: string) {
    return this.cookies[key];
  }
}
