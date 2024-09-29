import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {CustomTokens} from '../../auth/custom-token/index.ts';
import {AuthCookies} from './AuthCookies.ts';
import {SetAuthCookiesOptions} from './index.ts';
import {ObjectCookiesProvider} from './parser/ObjectCookiesProvider.ts';

const cookieName = 'TestCookie';
const cookieSerializeOptions = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  maxAge: 12 * 60 * 60 * 24,
  expires: new Date(1727373870 * 1000)
};
const setAuthCookiesOptions: SetAuthCookiesOptions = {
  cookieName,
  cookieSerializeOptions,
  cookieSignatureKeys: ['secret'],
  apiKey: 'test-api-key'
};

const mockTokens: CustomTokens = {
  idToken: 'id-token',
  refreshToken: 'refresh-token',
  customToken: 'custom-token'
};

describe('AuthCookies', () => {
  describe('headers', () => {
    it('should set single cookie', async () => {
      const provider = new ObjectCookiesProvider({});
      const cookies = new AuthCookies(provider, setAuthCookiesOptions);
      const headers = {append: jest.fn()} as unknown as Headers;

      await cookies.setAuthHeaders(mockTokens, headers);

      expect(headers.append).toHaveBeenCalledTimes(1);
      expect(headers.append).toHaveBeenCalledWith(
        'Set-Cookie',
        'TestCookie=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6ImlkLXRva2VuIiwicmVmcmVzaF90b2tlbiI6InJlZnJlc2gtdG9rZW4iLCJjdXN0b21fdG9rZW4iOiJjdXN0b20tdG9rZW4ifQ.ExxN2rNayg2XCR6WNeZmY8tAyc_qyiZ2YdzITRbQocs; Max-Age=1036800; Path=/; Expires=Thu, 26 Sep 2024 18:04:30 GMT; HttpOnly; Secure; SameSite=Lax'
      );
    });

    it('should set multiple cookies', async () => {
      const provider = new ObjectCookiesProvider({});
      const cookies = new AuthCookies(provider, {
        ...setAuthCookiesOptions,
        enableMultipleCookies: true
      });
      const headers = {append: jest.fn()} as unknown as Headers;

      await cookies.setAuthHeaders(mockTokens, headers);

      expect(headers.append).toHaveBeenCalledTimes(4);
      expect(headers.append).toHaveBeenCalledWith(
        'Set-Cookie',
        'TestCookie.id=id-token; Max-Age=1036800; Path=/; Expires=Thu, 26 Sep 2024 18:04:30 GMT; HttpOnly; Secure; SameSite=Lax'
      );
      expect(headers.append).toHaveBeenCalledWith(
        'Set-Cookie',
        'TestCookie.refresh=refresh-token; Max-Age=1036800; Path=/; Expires=Thu, 26 Sep 2024 18:04:30 GMT; HttpOnly; Secure; SameSite=Lax'
      );
      expect(headers.append).toHaveBeenCalledWith(
        'Set-Cookie',
        'TestCookie.custom=custom-token; Max-Age=1036800; Path=/; Expires=Thu, 26 Sep 2024 18:04:30 GMT; HttpOnly; Secure; SameSite=Lax'
      );
      expect(headers.append).toHaveBeenCalledWith(
        'Set-Cookie',
        'TestCookie.sig=QupyAMaPmI6d90CqB0lvec5Q517onmUvXEk6bONTQM0; Max-Age=1036800; Path=/; Expires=Thu, 26 Sep 2024 18:04:30 GMT; HttpOnly; Secure; SameSite=Lax'
      );
    });

    it('should set multiple cookies and remove single cookie if exists', async () => {
      const provider = new ObjectCookiesProvider({
        TestCookie: 'legacy-token'
      });
      const cookies = new AuthCookies(provider, {
        ...setAuthCookiesOptions,
        enableMultipleCookies: true
      });
      const headers = {append: jest.fn()} as unknown as Headers;

      await cookies.setAuthHeaders(mockTokens, headers);

      expect(headers.append).toHaveBeenCalledTimes(5);
      expect(headers.append).toHaveBeenNthCalledWith(
        1,
        'Set-Cookie',
        'TestCookie=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
      );
      expect(headers.append).toHaveBeenCalledWith(
        'Set-Cookie',
        'TestCookie.id=id-token; Max-Age=1036800; Path=/; Expires=Thu, 26 Sep 2024 18:04:30 GMT; HttpOnly; Secure; SameSite=Lax'
      );
      expect(headers.append).toHaveBeenCalledWith(
        'Set-Cookie',
        'TestCookie.refresh=refresh-token; Max-Age=1036800; Path=/; Expires=Thu, 26 Sep 2024 18:04:30 GMT; HttpOnly; Secure; SameSite=Lax'
      );
      expect(headers.append).toHaveBeenCalledWith(
        'Set-Cookie',
        'TestCookie.custom=custom-token; Max-Age=1036800; Path=/; Expires=Thu, 26 Sep 2024 18:04:30 GMT; HttpOnly; Secure; SameSite=Lax'
      );
      expect(headers.append).toHaveBeenCalledWith(
        'Set-Cookie',
        'TestCookie.sig=QupyAMaPmI6d90CqB0lvec5Q517onmUvXEk6bONTQM0; Max-Age=1036800; Path=/; Expires=Thu, 26 Sep 2024 18:04:30 GMT; HttpOnly; Secure; SameSite=Lax'
      );
    });

    it('should set single cookie and remove multiple cookie if exists', async () => {
      const provider = new ObjectCookiesProvider({
        'TestCookie.id': 'legacy-id-token',
        'TestCookie.refresh': 'legacy-refresh-token',
        'TestCookie.custom': 'legacy-custom-token',
        'TestCookie.sig': 'legacy-signature'
      });
      const cookies = new AuthCookies(provider, setAuthCookiesOptions);
      const headers = {append: jest.fn()} as unknown as Headers;

      await cookies.setAuthHeaders(mockTokens, headers);

      expect(headers.append).toHaveBeenCalledTimes(5);
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
      expect(headers.append).toHaveBeenNthCalledWith(
        5,
        'Set-Cookie',
        'TestCookie=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6ImlkLXRva2VuIiwicmVmcmVzaF90b2tlbiI6InJlZnJlc2gtdG9rZW4iLCJjdXN0b21fdG9rZW4iOiJjdXN0b20tdG9rZW4ifQ.ExxN2rNayg2XCR6WNeZmY8tAyc_qyiZ2YdzITRbQocs; Max-Age=1036800; Path=/; Expires=Thu, 26 Sep 2024 18:04:30 GMT; HttpOnly; Secure; SameSite=Lax'
      );
    });

    it('should set single cookie and remove legacy multiple cookie if exists', async () => {
      const provider = new ObjectCookiesProvider({
        TestCookie: 'legacy-id-token:legacy-refresh-token',
        'TestCookie.custom': 'legacy-custom-token',
        'TestCookie.sig': 'legacy-signature'
      });
      const cookies = new AuthCookies(provider, setAuthCookiesOptions);
      const headers = {append: jest.fn()} as unknown as Headers;

      await cookies.setAuthHeaders(mockTokens, headers);

      expect(headers.append).toHaveBeenCalledTimes(5);
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
      expect(headers.append).toHaveBeenNthCalledWith(
        5,
        'Set-Cookie',
        'TestCookie=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6ImlkLXRva2VuIiwicmVmcmVzaF90b2tlbiI6InJlZnJlc2gtdG9rZW4iLCJjdXN0b21fdG9rZW4iOiJjdXN0b20tdG9rZW4ifQ.ExxN2rNayg2XCR6WNeZmY8tAyc_qyiZ2YdzITRbQocs; Max-Age=1036800; Path=/; Expires=Thu, 26 Sep 2024 18:04:30 GMT; HttpOnly; Secure; SameSite=Lax'
      );
    });
  });

  describe('cookies', () => {
    it('should set single cookie', async () => {
      const provider = new ObjectCookiesProvider({});
      const cookies = new AuthCookies(provider, setAuthCookiesOptions);
      const requestCookies = {
        set: jest.fn(),
        delete: jest.fn()
      } as unknown as RequestCookies;

      await cookies.setAuthCookies(mockTokens, requestCookies);

      expect(requestCookies.set).toHaveBeenCalledTimes(1);
      expect(requestCookies.set).toHaveBeenCalledWith(
        'TestCookie',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6ImlkLXRva2VuIiwicmVmcmVzaF90b2tlbiI6InJlZnJlc2gtdG9rZW4iLCJjdXN0b21fdG9rZW4iOiJjdXN0b20tdG9rZW4ifQ.ExxN2rNayg2XCR6WNeZmY8tAyc_qyiZ2YdzITRbQocs',
        cookieSerializeOptions
      );
    });

    it('should set multiple cookies', async () => {
      const provider = new ObjectCookiesProvider({});
      const cookies = new AuthCookies(provider, {
        ...setAuthCookiesOptions,
        enableMultipleCookies: true
      });
      const requestCookies = {
        set: jest.fn(),
        delete: jest.fn()
      } as unknown as RequestCookies;

      await cookies.setAuthCookies(mockTokens, requestCookies);

      expect(requestCookies.set).toHaveBeenCalledTimes(4);
      expect(requestCookies.set).toHaveBeenCalledWith(
        'TestCookie.id',
        'id-token',
        cookieSerializeOptions
      );
      expect(requestCookies.set).toHaveBeenCalledWith(
        'TestCookie.refresh',
        'refresh-token',
        cookieSerializeOptions
      );
      expect(requestCookies.set).toHaveBeenCalledWith(
        'TestCookie.custom',
        'custom-token',
        cookieSerializeOptions
      );
      expect(requestCookies.set).toHaveBeenCalledWith(
        'TestCookie.sig',
        'QupyAMaPmI6d90CqB0lvec5Q517onmUvXEk6bONTQM0',
        cookieSerializeOptions
      );
    });

    it('should set multiple cookies and remove single cookie if exists', async () => {
      const provider = new ObjectCookiesProvider({
        TestCookie: 'legacy-token'
      });
      const cookies = new AuthCookies(provider, {
        ...setAuthCookiesOptions,
        enableMultipleCookies: true
      });
      const requestCookies = {
        set: jest.fn(),
        delete: jest.fn()
      } as unknown as RequestCookies;

      await cookies.setAuthCookies(mockTokens, requestCookies);

      expect(requestCookies.delete).toHaveBeenCalledTimes(1);
      expect(requestCookies.delete).toHaveBeenCalledWith('TestCookie');

      expect(requestCookies.set).toHaveBeenCalledTimes(4);
      expect(requestCookies.set).toHaveBeenCalledWith(
        'TestCookie.id',
        'id-token',
        cookieSerializeOptions
      );
      expect(requestCookies.set).toHaveBeenCalledWith(
        'TestCookie.refresh',
        'refresh-token',
        cookieSerializeOptions
      );
      expect(requestCookies.set).toHaveBeenCalledWith(
        'TestCookie.custom',
        'custom-token',
        cookieSerializeOptions
      );
      expect(requestCookies.set).toHaveBeenCalledWith(
        'TestCookie.sig',
        'QupyAMaPmI6d90CqB0lvec5Q517onmUvXEk6bONTQM0',
        cookieSerializeOptions
      );
    });

    it('should set single cookie and remove multiple cookie if exists', async () => {
      const provider = new ObjectCookiesProvider({
        'TestCookie.id': 'legacy-id-token',
        'TestCookie.refresh': 'legacy-refresh-token',
        'TestCookie.custom': 'legacy-custom-token',
        'TestCookie.sig': 'legacy-signature'
      });
      const cookies = new AuthCookies(provider, setAuthCookiesOptions);
      const requestCookies = {
        set: jest.fn(),
        delete: jest.fn()
      } as unknown as RequestCookies;

      await cookies.setAuthCookies(mockTokens, requestCookies);

      expect(requestCookies.delete).toHaveBeenCalledTimes(4);
      expect(requestCookies.delete).toHaveBeenCalledWith('TestCookie.id');
      expect(requestCookies.delete).toHaveBeenCalledWith('TestCookie.refresh');
      expect(requestCookies.delete).toHaveBeenCalledWith('TestCookie.custom');
      expect(requestCookies.delete).toHaveBeenCalledWith('TestCookie.sig');

      expect(requestCookies.set).toHaveBeenCalledTimes(1);
      expect(requestCookies.set).toHaveBeenCalledWith(
        'TestCookie',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6ImlkLXRva2VuIiwicmVmcmVzaF90b2tlbiI6InJlZnJlc2gtdG9rZW4iLCJjdXN0b21fdG9rZW4iOiJjdXN0b20tdG9rZW4ifQ.ExxN2rNayg2XCR6WNeZmY8tAyc_qyiZ2YdzITRbQocs',
        cookieSerializeOptions
      );
    });

    it('should set single cookie and remove legacy multiple cookie if exists', async () => {
      const provider = new ObjectCookiesProvider({
        TestCookie: 'legacy-id-token:legacy-refresh-token',
        'TestCookie.custom': 'legacy-custom-token',
        'TestCookie.sig': 'legacy-signature'
      });
      const cookies = new AuthCookies(provider, setAuthCookiesOptions);
      const requestCookies = {
        set: jest.fn(),
        delete: jest.fn()
      } as unknown as RequestCookies;

      await cookies.setAuthCookies(mockTokens, requestCookies);

      expect(requestCookies.delete).toHaveBeenCalledTimes(4);
      expect(requestCookies.delete).toHaveBeenCalledWith('TestCookie.id');
      expect(requestCookies.delete).toHaveBeenCalledWith('TestCookie.refresh');
      expect(requestCookies.delete).toHaveBeenCalledWith('TestCookie.custom');
      expect(requestCookies.delete).toHaveBeenCalledWith('TestCookie.sig');

      expect(requestCookies.set).toHaveBeenCalledTimes(1);
      expect(requestCookies.set).toHaveBeenCalledWith(
        'TestCookie',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6ImlkLXRva2VuIiwicmVmcmVzaF90b2tlbiI6InJlZnJlc2gtdG9rZW4iLCJjdXN0b21fdG9rZW4iOiJjdXN0b20tdG9rZW4ifQ.ExxN2rNayg2XCR6WNeZmY8tAyc_qyiZ2YdzITRbQocs',
        cookieSerializeOptions
      );
    });
  });
});
