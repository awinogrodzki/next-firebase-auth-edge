import {InvalidTokenError, InvalidTokenReason} from '../../../auth/error.ts';
import {Cookie} from '../builder/CookieBuilder.js';
import {GetCookiesTokensOptions} from '../types.ts';
import {CookieParserFactory} from './CookieParserFactory.js';
import {MultipleCookiesParser} from './MultipleCookiesParser.ts';
import {SingleCookieParser} from './SingleCookieParser.ts';

const testCookie = {
  name: 'TestCookie',
  value:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6ImlkLXRva2VuIiwicmVmcmVzaF90b2tlbiI6InJlZnJlc2gtdG9rZW4iLCJjdXN0b21fdG9rZW4iOiJjdXN0b20tdG9rZW4ifQ.ExxN2rNayg2XCR6WNeZmY8tAyc_qyiZ2YdzITRbQocs'
};

const testCookieHeader = toHeader(testCookie);

function toHeader(cookie: Cookie): string {
  return `${cookie.name}=${cookie.value}`;
}

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

const testCookiesHeader = testCookies.map(toHeader).join(';');

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

const legacyCookiesHeader = legacyTestCookies.map(toHeader).join(';');

const testCookiesObj = testCookies.reduce(
  (acc, cookie) => ({
    ...acc,
    [cookie.name]: cookie.value
  }),
  {
    [testCookie.name]: testCookie.value
  }
);

const legacyTestCookiesObj = legacyTestCookies.reduce(
  (acc, cookie) => ({
    ...acc,
    [cookie.name]: cookie.value
  }),
  {
    [testCookie.name]: testCookie.value
  }
);

const mockOptions = {
  cookieName: 'TestCookie',
  cookieSignatureKeys: ['secret']
} as unknown as GetCookiesTokensOptions;

describe('CookieParserFactory', () => {
  describe('fromHeaders', () => {
    it('should create single cookie parser if request does not have multiple cookies', () => {
      const mockHeaders = new Headers();
      mockHeaders.set('Cookie', testCookieHeader);

      const result = CookieParserFactory.fromHeaders(mockHeaders, mockOptions);
      expect(result).toBeInstanceOf(SingleCookieParser);
    });

    it('should create single cookie parser if request does not have any cookies', () => {
      const result = CookieParserFactory.fromHeaders(
        new Headers(),
        mockOptions
      );

      expect(result).toBeInstanceOf(SingleCookieParser);

      return expect(() => result.parseCookies()).rejects.toEqual(
        new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS)
      );
    });

    it('should create multiple cookie parser if request does have all required cookies', () => {
      const mockHeaders = new Headers();
      mockHeaders.set('Cookie', testCookiesHeader);

      const result = CookieParserFactory.fromHeaders(mockHeaders, mockOptions);

      expect(result).toBeInstanceOf(MultipleCookiesParser);
    });

    it('should throw invalid credentials error if deprecated notation is used', () => {
      const mockHeaders = new Headers();
      mockHeaders.set(
        'Cookie',
        `TestCookie=${testCookies[0].value}:${testCookies[1].value}`
      );

      return expect(() =>
        CookieParserFactory.fromHeaders(mockHeaders, mockOptions)
      ).toThrow(new InvalidTokenError(InvalidTokenReason.INVALID_CREDENTIALS));
    });

    it('should create multiple cookie parser if request has legacy cookies', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('Cookie', legacyCookiesHeader);

      const parser = CookieParserFactory.fromHeaders(mockHeaders, mockOptions);

      expect(parser).toBeInstanceOf(MultipleCookiesParser);

      const result = await parser.parseCookies();

      expect(result).toEqual({
        customToken: 'custom-token',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        metadata: {}
      });
    });
  });

  describe('fromObject', () => {
    it('should create single cookie parser if request does not have multiple cookies', async () => {
      const parser = CookieParserFactory.fromObject(
        {TestCookie: testCookiesObj['TestCookie']},
        mockOptions
      );

      expect(parser).toBeInstanceOf(SingleCookieParser);

      const result = await parser.parseCookies();

      expect(result).toEqual({
        customToken: 'custom-token',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        metadata: {}
      });
    });

    it('should create single cookie parser if request does not have any cookies', () => {
      const result = CookieParserFactory.fromObject({}, mockOptions);

      expect(result).toBeInstanceOf(SingleCookieParser);

      return expect(() => result.parseCookies()).rejects.toEqual(
        new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS)
      );
    });

    it('should create multiple cookie parser if request does have all required cookies', async () => {
      const parser = CookieParserFactory.fromObject(
        testCookiesObj,
        mockOptions
      );

      expect(parser).toBeInstanceOf(MultipleCookiesParser);

      const result = await parser.parseCookies();

      expect(result).toEqual({
        customToken: 'custom-token',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        metadata: {}
      });
    });

    it('should create multiple cookie parser if request has legacy cookies', async () => {
      const parser = CookieParserFactory.fromObject(
        legacyTestCookiesObj,
        mockOptions
      );

      expect(parser).toBeInstanceOf(MultipleCookiesParser);

      const result = await parser.parseCookies();

      expect(result).toEqual({
        customToken: 'custom-token',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        metadata: {}
      });
    });

    it('should throw invalid credentials error if deprecated notation is used', () => {
      return expect(() =>
        CookieParserFactory.fromObject(
          {
            TestCookie: `${testCookies[0].value}:${testCookies[1].value}`
          },
          mockOptions
        )
      ).toThrow(new InvalidTokenError(InvalidTokenReason.INVALID_CREDENTIALS));
    });
  });
});
