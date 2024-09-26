import {InvalidTokenError, InvalidTokenReason} from '../../../auth/error.ts';
import {RequestCookiesProvider} from './RequestCookiesProvider.ts';
import {SingleCookieParser} from './SingleCookieParser.js';
import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';

const mockCookie = {
  name: 'TestCookie',
  value:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6ImlkLXRva2VuIiwicmVmcmVzaF90b2tlbiI6InJlZnJlc2gtdG9rZW4iLCJjdXN0b21fdG9rZW4iOiJjdXN0b20tdG9rZW4ifQ.ExxN2rNayg2XCR6WNeZmY8tAyc_qyiZ2YdzITRbQocs'
};

describe('SingleCookieParser', () => {
  let mockCookies: RequestCookies;
  let mockCookiesProvider: RequestCookiesProvider;

  beforeEach(() => {
    mockCookies = {
      get: jest.fn(() => mockCookie)
    } as unknown as RequestCookies;
    mockCookiesProvider = new RequestCookiesProvider(mockCookies);
  });

  it('should parse a jwt cookie', async () => {
    const parser = new SingleCookieParser(mockCookiesProvider, 'TestCookie', [
      'secret'
    ]);

    const result = await parser.parseCookies();

    expect(result).toEqual({
      customToken: 'custom-token',
      idToken: 'id-token',
      refreshToken: 'refresh-token'
    });

    expect(mockCookies.get).toHaveBeenCalledWith('TestCookie');
  });

  it('should throw missing credentials error if cookie is empty', () => {
    (mockCookies.get as jest.Mock).mockImplementationOnce(() => ({
      name: 'TestCookie',
      value: undefined
    }));

    const parser = new SingleCookieParser(mockCookiesProvider, 'TestCookie', [
      'secret'
    ]);

    return expect(() => parser.parseCookies()).rejects.toEqual(
      new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS)
    );
  });

  it('should throw invalid signature error if signature is incorrect', () => {
    const parser = new SingleCookieParser(mockCookiesProvider, 'TestCookie', [
      'incorrect-secret'
    ]);

    return expect(() => parser.parseCookies()).rejects.toEqual(
      new InvalidTokenError(InvalidTokenReason.INVALID_SIGNATURE)
    );
  });
});
