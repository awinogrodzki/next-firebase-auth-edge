import {Cookie} from '../builder/CookieBuilder.js';
import {RequestCookiesProvider} from '../parser/RequestCookiesProvider.js';
import {CookieRemoverFactory} from './CookieRemoverFactory.js';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';

const cookieName = 'TestCookie';
const cookieSerializeOptions = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  maxAge: 12 * 60 * 60 * 24,
  expires: new Date(1727373870 * 1000)
};

const testCookies: Cookie[] = [
  {
    name: 'TestCookie.id',
    value: 'id-token'
  },
  {
    name: 'TestCookie.refresh',
    value: 'refresh-token'
  },
  {
    name: 'TestCookie.custom',
    value: 'custom-token'
  },
  {
    name: 'TestCookie.sig',
    value: 'QupyAMaPmI6d90CqB0lvec5Q517onmUvXEk6bONTQM0'
  }
];

const legacyTestCookies: Cookie[] = [
  {
    name: 'TestCookie',
    value: 'id-token:refresh-token'
  },
  {
    name: 'TestCookie.custom',
    value: 'custom-token'
  },
  {
    name: 'TestCookie.sig',
    value: 'QupyAMaPmI6d90CqB0lvec5Q517onmUvXEk6bONTQM0'
  }
];

function getTestCookie(name: string) {
  return testCookies.find((it) => it.name === name);
}

function getLegacyTestCookie(name: string) {
  return legacyTestCookies.find((it) => it.name === name);
}

function getSingleCookie(name: string) {
  if (name === cookieName) {
    return {
      name: cookieName,
      value: 'single-cookie'
    };
  }

  return undefined;
}

describe('CookieRemoverFactory', () => {
  it('should remove a single cookie', () => {
    const headers = {append: jest.fn()} as unknown as Headers;
    const cookies = {get: jest.fn()} as unknown as RequestCookies;

    const remover = CookieRemoverFactory.fromHeaders(
      headers,
      new RequestCookiesProvider(cookies),
      cookieName
    );

    remover.expireCookies(cookieSerializeOptions);

    expect(headers.append).toHaveBeenCalledTimes(1);
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
  });

  it('should remove multiple cookies', () => {
    const headers = {append: jest.fn()} as unknown as Headers;
    const cookies = {get: jest.fn(getTestCookie)} as unknown as RequestCookies;

    const remover = CookieRemoverFactory.fromHeaders(
      headers,
      new RequestCookiesProvider(cookies),
      cookieName
    );

    remover.expireCookies(cookieSerializeOptions);

    expect(headers.append).toHaveBeenCalledTimes(4);
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie.id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie.refresh=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie.custom=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie.sig=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
  });

  it('should remove multiple and single cookies when there are both', () => {
    const headers = {append: jest.fn()} as unknown as Headers;
    const cookies = {
      get: jest.fn((name) => {
        return getSingleCookie(name) ?? getTestCookie(name);
      })
    } as unknown as RequestCookies;

    const remover = CookieRemoverFactory.fromHeaders(
      headers,
      new RequestCookiesProvider(cookies),
      cookieName
    );

    remover.expireCookies(cookieSerializeOptions);

    expect(headers.append).toHaveBeenCalledTimes(5);
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie.id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie.refresh=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie.custom=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie.sig=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
  });

  it('should remove multiple and single cookies when there are legacy cookies', () => {
    const headers = {append: jest.fn()} as unknown as Headers;
    const cookies = {
      get: jest.fn((name) => {
        return getLegacyTestCookie(name);
      })
    } as unknown as RequestCookies;

    const remover = CookieRemoverFactory.fromHeaders(
      headers,
      new RequestCookiesProvider(cookies),
      cookieName
    );

    remover.expireCookies(cookieSerializeOptions);

    expect(headers.append).toHaveBeenCalledTimes(5);
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie.id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie.refresh=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie.custom=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      'TestCookie.sig=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
  });
});
