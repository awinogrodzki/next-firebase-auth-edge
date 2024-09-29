import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {InvalidTokenError, InvalidTokenReason} from '../../../auth/error.ts';
import {GetCookiesTokensOptions} from '../../tokens.ts';
import {Cookie} from '../builder/CookieBuilder.js';
import {CookieParserFactory} from './CookieParserFactory.js';
import {MultipleCookiesParser} from './MultipleCookiesParser.ts';
import {SingleCookieParser} from './SingleCookieParser.ts';

const testCookie = {
  name: 'TestCookie',
  value:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6ImlkLXRva2VuIiwicmVmcmVzaF90b2tlbiI6InJlZnJlc2gtdG9rZW4iLCJjdXN0b21fdG9rZW4iOiJjdXN0b20tdG9rZW4ifQ.ExxN2rNayg2XCR6WNeZmY8tAyc_qyiZ2YdzITRbQocs'
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
  describe('fromRequestCookies', () => {
    let mockCookies: jest.Mocked<RequestCookies>;

    beforeEach(() => {
      mockCookies = {
        get: jest.fn(),
        has: jest.fn()
      } as unknown as jest.Mocked<RequestCookies>;
    });

    it('should create single cookie parser if request does not have multiple cookies', () => {
      (mockCookies.get as jest.Mock).mockImplementation((name: string) => {
        if (name === 'TestCookie') {
          return testCookie;
        }

        return undefined;
      });
      (mockCookies.has as jest.Mock).mockImplementation((name: string) => {
        if (name === 'TestCookie') {
          return true;
        }

        return false;
      });

      const result = CookieParserFactory.fromRequestCookies(
        mockCookies,
        mockOptions
      );

      expect(result).toBeInstanceOf(SingleCookieParser);
    });

    it('should create single cookie parser if request does not have any cookies', () => {
      (mockCookies.get as jest.Mock).mockImplementation(() => {
        return undefined;
      });
      (mockCookies.has as jest.Mock).mockImplementation(() => {
        return false;
      });

      const result = CookieParserFactory.fromRequestCookies(
        mockCookies,
        mockOptions
      );

      expect(result).toBeInstanceOf(SingleCookieParser);

      return expect(() => result.parseCookies()).rejects.toEqual(
        new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS)
      );
    });

    it('should create multiple cookie parser if request does have all required cookies', () => {
      (mockCookies.get as jest.Mock).mockImplementation((name: string) => {
        return testCookies.find((it) => it.name === name);
      });
      (mockCookies.has as jest.Mock).mockImplementation((name: string) => {
        return testCookies.findIndex((it) => it.name === name) > -1;
      });

      const result = CookieParserFactory.fromRequestCookies(
        mockCookies,
        mockOptions
      );

      expect(result).toBeInstanceOf(MultipleCookiesParser);
    });

    it('should throw invalid credentials error if deprecated notation is used', () => {
      (mockCookies.get as jest.Mock).mockImplementation((name: string) => {
        if (name === 'TestCookie') {
          return {
            ...testCookie,
            value: `${testCookies[0].value}:${testCookies[1].value}`
          };
        }

        return undefined;
      });
      (mockCookies.has as jest.Mock).mockImplementation((name: string) => {
        if (name === 'TestCookie') {
          return true;
        }

        return false;
      });

      return expect(() =>
        CookieParserFactory.fromRequestCookies(mockCookies, mockOptions)
      ).toThrow(new InvalidTokenError(InvalidTokenReason.INVALID_CREDENTIALS));
    });

    it('should create multiple cookie parser if request has legacy cookies', async () => {
      (mockCookies.get as jest.Mock).mockImplementation((name: string) => {
        return legacyTestCookies.find((it) => it.name === name);
      });
      (mockCookies.has as jest.Mock).mockImplementation((name: string) => {
        return legacyTestCookies.findIndex((it) => it.name === name) > -1;
      });

      const parser = CookieParserFactory.fromRequestCookies(
        mockCookies,
        mockOptions
      );

      expect(parser).toBeInstanceOf(MultipleCookiesParser);

      const result = await parser.parseCookies();

      expect(result).toEqual({
        customToken: 'custom-token',
        idToken: 'id-token',
        refreshToken: 'refresh-token'
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
        refreshToken: 'refresh-token'
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
        refreshToken: 'refresh-token'
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
        refreshToken: 'refresh-token'
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
