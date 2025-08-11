import {Cookie} from '../builder/CookieBuilder.js';
import {RequestCookiesProvider} from '../parser/RequestCookiesProvider.js';
import {CookieRemoverFactory} from './CookieRemoverFactory';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';

const cookieName = 'TestCookie';

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
    const cookies = {
      get: jest.fn(),
      delete: jest.fn()
    } as unknown as RequestCookies;

    const remover = CookieRemoverFactory.fromRequestCookies(
      cookies,
      new RequestCookiesProvider(cookies),
      cookieName
    );

    remover.removeCookies();

    expect(cookies.delete).toHaveBeenCalledTimes(1);
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie');
  });

  it('should remove multiple cookies', () => {
    const cookies = {
      get: jest.fn(getTestCookie),
      delete: jest.fn()
    } as unknown as RequestCookies;

    const remover = CookieRemoverFactory.fromRequestCookies(
      cookies,
      new RequestCookiesProvider(cookies),
      cookieName
    );

    remover.removeCookies();

    expect(cookies.delete).toHaveBeenCalledTimes(5);
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.id');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.refresh');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.custom');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.metadata');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.sig');
  });

  it('should remove multiple and single cookies when there are both', () => {
    const cookies = {
      get: jest.fn((name) => {
        return getSingleCookie(name) ?? getTestCookie(name);
      }),
      delete: jest.fn()
    } as unknown as RequestCookies;

    const remover = CookieRemoverFactory.fromRequestCookies(
      cookies,
      new RequestCookiesProvider(cookies),
      cookieName
    );

    remover.removeCookies();

    expect(cookies.delete).toHaveBeenCalledTimes(6);
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.id');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.refresh');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.custom');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.metadata');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.sig');
  });

  it('should remove multiple and single cookies when there are legacy cookies', () => {
    const cookies = {
      get: jest.fn((name) => {
        return getLegacyTestCookie(name);
      }),
      delete: jest.fn()
    } as unknown as RequestCookies;

    const remover = CookieRemoverFactory.fromRequestCookies(
      cookies,
      new RequestCookiesProvider(cookies),
      cookieName
    );

    remover.removeCookies();

    expect(cookies.delete).toHaveBeenCalledTimes(6);
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.id');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.refresh');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.custom');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.metadata');
    expect(cookies.delete).toHaveBeenCalledWith('TestCookie.sig');
  });
});
