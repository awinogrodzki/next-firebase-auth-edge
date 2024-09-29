import {InvalidTokenError, InvalidTokenReason} from '../../../auth/error.ts';
import {CookiesProvider} from './CookiesProvider.ts';
import {MultipleCookiesParser} from './MultipleCookiesParser.js';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {RequestCookiesProvider} from './RequestCookiesProvider.ts';

const testCookies = [
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

describe('MultipleCookiesParser', () => {
  let mockCookies: RequestCookies;
  let mockCookiesProvider: CookiesProvider;

  beforeEach(() => {
    mockCookies = {
      get: jest.fn((name: string) =>
        testCookies.find((cookie) => name === cookie.name)
      )
    } as unknown as RequestCookies;
    mockCookiesProvider = new RequestCookiesProvider(mockCookies);
  });

  it('should parse multiple cookies', async () => {
    const parser = new MultipleCookiesParser(
      mockCookiesProvider,
      'TestCookie',
      ['secret']
    );

    const result = await parser.parseCookies();

    expect(result).toEqual({
      customToken: 'custom-token',
      idToken: 'id-token',
      refreshToken: 'refresh-token'
    });

    expect(mockCookies.get).toHaveBeenNthCalledWith(1, 'TestCookie.id');
    expect(mockCookies.get).toHaveBeenNthCalledWith(2, 'TestCookie.refresh');
    expect(mockCookies.get).toHaveBeenNthCalledWith(3, 'TestCookie.custom');
    expect(mockCookies.get).toHaveBeenNthCalledWith(4, 'TestCookie.sig');
  });

  it('should throw missing credentials error if id token is empty', () => {
    (mockCookies.get as jest.Mock).mockImplementation((name: string) =>
      testCookies
        .filter((it) => !it.name.endsWith('.id'))
        .find((it) => it.name === name)
    );

    const parser = new MultipleCookiesParser(
      mockCookiesProvider,
      'TestCookie',
      ['secret']
    );

    return expect(() => parser.parseCookies()).rejects.toEqual(
      new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS)
    );
  });

  it('should throw missing credentials error if refresh token is empty', () => {
    (mockCookies.get as jest.Mock).mockImplementation((name: string) =>
      testCookies
        .filter((it) => !it.name.endsWith('.refresh'))
        .find((it) => it.name === name)
    );

    const parser = new MultipleCookiesParser(
      mockCookiesProvider,
      'TestCookie',
      ['secret']
    );

    return expect(() => parser.parseCookies()).rejects.toEqual(
      new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS)
    );
  });

  it('should throw missing credentials error if custom token is empty', () => {
    (mockCookies.get as jest.Mock).mockImplementation((name: string) =>
      testCookies
        .filter((it) => !it.name.endsWith('.custom'))
        .find((it) => it.name === name)
    );

    const parser = new MultipleCookiesParser(
      mockCookiesProvider,
      'TestCookie',
      ['secret']
    );

    return expect(() => parser.parseCookies()).rejects.toEqual(
      new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS)
    );
  });

  it('should throw missing credentials error if signature is empty', () => {
    (mockCookies.get as jest.Mock).mockImplementation((name: string) =>
      testCookies
        .filter((it) => !it.name.endsWith('.sig'))
        .find((it) => it.name === name)
    );

    const parser = new MultipleCookiesParser(
      mockCookiesProvider,
      'TestCookie',
      ['secret']
    );

    return expect(() => parser.parseCookies()).rejects.toEqual(
      new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS)
    );
  });

  it('should throw invalid signature error if signature is incorrect', () => {
    const parser = new MultipleCookiesParser(
      mockCookiesProvider,
      'TestCookie',
      ['incorrect-secret']
    );

    return expect(() => parser.parseCookies()).rejects.toEqual(
      new InvalidTokenError(InvalidTokenReason.INVALID_SIGNATURE)
    );
  });
});
