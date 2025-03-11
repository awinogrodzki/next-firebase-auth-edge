import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {
  SetAuthCookiesOptions,
  appendAuthCookies,
  refreshCredentials,
  setAuthCookies
} from '../cookies/index.js';

// Suppress "Property 'headers' does not exist on type NextRequest/NextResponse" error
declare module 'next/server' {
  export interface NextRequest {
    headers: Headers;
  }

  export interface NextResponse {
    headers: Headers;
  }
}

jest.mock('../../auth/index.js', () => ({
  getFirebaseAuth: () => ({
    handleTokenRefresh: () => ({
      idToken: 'TEST_ID_TOKEN',
      refreshToken: 'TEST_REFRESH_TOKEN',
      customToken: 'TEST_CUSTOM_TOKEN'
    })
  })
}));

const secret = 'very-secure-secret';
const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6Ik1PQ0tfSURfVE9LRU4iLCJjdXN0b21fdG9rZW4iOiJNT0NLX0NVU1RPTV9UT0tFTiIsInJlZnJlc2hfdG9rZW4iOiJNT0NLX1JFRlJFU0hfVE9LRU4ifQ.K5jwTcAlfffzuM2_WaKJ93QwgqeCpWjg7TMx1lulSO4';
const refreshedJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6IlRFU1RfSURfVE9LRU4iLCJyZWZyZXNoX3Rva2VuIjoiVEVTVF9SRUZSRVNIX1RPS0VOIiwiY3VzdG9tX3Rva2VuIjoiVEVTVF9DVVNUT01fVE9LRU4ifQ.2tjn-__AKP3J7w9vIDuFDFkYmPzpuGpWvHvBFksMh5E';

const MOCK_OPTIONS: SetAuthCookiesOptions<never> = {
  cookieName: 'TestCookie',
  cookieSignatureKeys: [secret],
  cookieSerializeOptions: {maxAge: 123, path: '/test-path', sameSite: 'lax'},
  apiKey: 'API_KEY',
  authorizationHeaderName: 'Next-Authorization',
  enableCustomToken: true
};

describe('cookies', () => {
  let MOCK_REQUEST: jest.Mocked<NextRequest>;

  beforeEach(() => {
    const mockHeaders = new Headers();
    mockHeaders.set('Cookie', `TestCookie=${jwt}`);
    MOCK_REQUEST = {
      cookies: {
        has: (key: string) => {
          if (key === 'TestCookie') {
            return true;
          }

          return false;
        },
        get: jest.fn((key: string) => {
          if (key === 'TestCookie') {
            return {value: jwt};
          }

          return undefined;
        }),
        set: jest.fn(),
        delete: jest.fn()
      },
      headers: mockHeaders
    } as unknown as jest.Mocked<NextRequest>;
  });

  const customTokens = {
    idToken: 'MOCK_ID_TOKEN',
    refreshToken: 'MOCK_REFRESH_TOKEN',
    customToken: 'MOCK_CUSTOM_TOKEN'
  };

  it('appends fresh cookie headers to the response', async () => {
    const MOCK_RESPONSE = {
      headers: {
        append: jest.fn()
      }
    } as unknown as jest.Mocked<NextResponse>;
    const result = await refreshCredentials(
      MOCK_REQUEST,
      MOCK_OPTIONS,
      () => MOCK_RESPONSE
    );

    expect(MOCK_REQUEST.cookies.set).toHaveBeenCalledWith(
      'TestCookie',
      refreshedJwt,
      {maxAge: 123, path: '/test-path', sameSite: 'lax'}
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      `TestCookie=${refreshedJwt}; Max-Age=123; Path=/test-path; SameSite=Lax`
    );

    expect(result).toBe(MOCK_RESPONSE);
  });

  it('appends fresh cookie headers without custom token to the response', async () => {
    const MOCK_RESPONSE = {
      headers: {
        append: jest.fn()
      }
    } as unknown as jest.Mocked<NextResponse>;
    const result = await refreshCredentials(
      MOCK_REQUEST,
      {...MOCK_OPTIONS, enableCustomToken: false},
      () => MOCK_RESPONSE
    );

    expect(MOCK_REQUEST.cookies.set).toHaveBeenCalledWith(
      'TestCookie',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6IlRFU1RfSURfVE9LRU4iLCJyZWZyZXNoX3Rva2VuIjoiVEVTVF9SRUZSRVNIX1RPS0VOIn0.Na_3Et62K3bs5WcTnvh6sEW_pnoiFw022gKXDCkuW-s',
      {maxAge: 123, path: '/test-path', sameSite: 'lax'}
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      `TestCookie=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6IlRFU1RfSURfVE9LRU4iLCJyZWZyZXNoX3Rva2VuIjoiVEVTVF9SRUZSRVNIX1RPS0VOIn0.Na_3Et62K3bs5WcTnvh6sEW_pnoiFw022gKXDCkuW-s; Max-Age=123; Path=/test-path; SameSite=Lax`
    );

    expect(result).toBe(MOCK_RESPONSE);
  });

  it('accepts async response factory function', async () => {
    const MOCK_RESPONSE = {
      headers: {
        append: jest.fn()
      }
    } as unknown as jest.Mocked<NextResponse>;
    const result = await refreshCredentials(MOCK_REQUEST, MOCK_OPTIONS, () =>
      Promise.resolve(MOCK_RESPONSE)
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      `TestCookie=${refreshedJwt}; Max-Age=123; Path=/test-path; SameSite=Lax`
    );

    expect(result).toBe(MOCK_RESPONSE);
  });

  it('generates multiple cookies', async () => {
    const MOCK_RESPONSE = {
      headers: {
        append: jest.fn()
      }
    } as unknown as jest.Mocked<NextResponse>;
    const result = await refreshCredentials(
      MOCK_REQUEST,
      {...MOCK_OPTIONS, enableMultipleCookies: true},
      () => Promise.resolve(MOCK_RESPONSE)
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      1,
      'Set-Cookie',
      'TestCookie=; Path=/test-path; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      2,
      'Set-Cookie',
      'TestCookie.id=TEST_ID_TOKEN; Max-Age=123; Path=/test-path; SameSite=Lax'
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      3,
      'Set-Cookie',
      'TestCookie.refresh=TEST_REFRESH_TOKEN; Max-Age=123; Path=/test-path; SameSite=Lax'
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      4,
      'Set-Cookie',
      'TestCookie.custom=TEST_CUSTOM_TOKEN; Max-Age=123; Path=/test-path; SameSite=Lax'
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      5,
      'Set-Cookie',
      'TestCookie.sig=MqBNRBcWwj7xL948-Yy89kj5dwPEf7fTACNx93rOFX4; Max-Age=123; Path=/test-path; SameSite=Lax'
    );

    expect(result).toBe(MOCK_RESPONSE);
  });

  it('appends multiple cookie headers', async () => {
    const MOCK_RESPONSE = {
      headers: {
        append: jest.fn()
      }
    } as unknown as jest.Mocked<NextResponse>;
    const mockHeaders = new Headers();
    await appendAuthCookies(mockHeaders, MOCK_RESPONSE, customTokens, {
      ...MOCK_OPTIONS,
      enableMultipleCookies: true
    });

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      1,
      'Set-Cookie',
      'TestCookie.id=MOCK_ID_TOKEN; Max-Age=123; Path=/test-path; SameSite=Lax'
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      2,
      'Set-Cookie',
      'TestCookie.refresh=MOCK_REFRESH_TOKEN; Max-Age=123; Path=/test-path; SameSite=Lax'
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      3,
      'Set-Cookie',
      'TestCookie.custom=MOCK_CUSTOM_TOKEN; Max-Age=123; Path=/test-path; SameSite=Lax'
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      4,
      'Set-Cookie',
      'TestCookie.sig=AuSOlUSJENTLtShQpjf7SMRiPY4aILyFNmjr7Tc3Fig; Max-Age=123; Path=/test-path; SameSite=Lax'
    );
  });

  it('skips custom token in multiple cookie headers', async () => {
    const MOCK_RESPONSE = {
      headers: {
        append: jest.fn()
      }
    } as unknown as jest.Mocked<NextResponse>;
    const mockHeaders = new Headers();
    await appendAuthCookies(mockHeaders, MOCK_RESPONSE, customTokens, {
      ...MOCK_OPTIONS,
      enableMultipleCookies: true,
      enableCustomToken: false
    });

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      1,
      'Set-Cookie',
      'TestCookie.id=MOCK_ID_TOKEN; Max-Age=123; Path=/test-path; SameSite=Lax'
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      2,
      'Set-Cookie',
      'TestCookie.refresh=MOCK_REFRESH_TOKEN; Max-Age=123; Path=/test-path; SameSite=Lax'
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      3,
      'Set-Cookie',
      'TestCookie.sig=kD-gd5CZhwndsyIvECTkfFsumUjj5UE1UpuxlxX5HWk; Max-Age=123; Path=/test-path; SameSite=Lax'
    );
  });

  it('appends custom auth headers', async () => {
    const MOCK_RESPONSE = {
      headers: {
        append: jest.fn(),
        get: jest.fn()
      }
    } as unknown as jest.Mocked<NextResponse>;

    await setAuthCookies(MOCK_RESPONSE.headers, MOCK_OPTIONS);

    expect(MOCK_RESPONSE.headers.get).toHaveBeenCalledWith(
      'Next-Authorization'
    );
  });
});
