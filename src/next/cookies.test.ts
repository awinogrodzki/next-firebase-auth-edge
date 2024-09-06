import {
  SetAuthCookiesOptions,
  appendAuthCookies,
  refreshCredentials,
  setAuthCookies
} from './cookies';

// Suppress "Property 'headers' does not exist on type NextRequest/NextResponse" error
declare module 'next/server' {
  export interface NextRequest {
    headers: Headers;
  }

  export interface NextResponse {
    headers: Headers;
  }
}

jest.mock('../auth', () => ({
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
const MOCK_REQUEST = {
  cookies: {
    get: (key: string) => {
      if (key === 'TestCookie') {
        return {value: jwt};
      }

      return undefined;
    },
    set: jest.fn()
  },
  headers: {
    get: jest.fn()
  }
} as unknown as jest.Mocked<any>;

const MOCK_OPTIONS: SetAuthCookiesOptions = {
  cookieName: 'TestCookie',
  cookieSignatureKeys: [secret],
  cookieSerializeOptions: {},
  apiKey: 'API_KEY',
  authorizationHeaderName: 'Next-Authorization'
};

describe('cookies', () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
    } as unknown as jest.Mocked<any> & jest.Mocked<Response>;
    const result = await refreshCredentials(
      MOCK_REQUEST,
      MOCK_OPTIONS,
      () => MOCK_RESPONSE
    );

    expect(MOCK_REQUEST.cookies.set).toHaveBeenCalledWith(
      'TestCookie',
      refreshedJwt
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      `TestCookie=${refreshedJwt}`
    );

    expect(result).toBe(MOCK_RESPONSE);
  });

  it('accepts async response factory function', async () => {
    const MOCK_RESPONSE = {
      headers: {
        append: jest.fn()
      }
    } as unknown as jest.Mocked<any> & jest.Mocked<Response>;
    const result = await refreshCredentials(MOCK_REQUEST, MOCK_OPTIONS, () =>
      Promise.resolve(MOCK_RESPONSE)
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      `TestCookie=${refreshedJwt}`
    );

    expect(result).toBe(MOCK_RESPONSE);
  });

  it('generates multiple cookies', async () => {
    const MOCK_RESPONSE = {
      headers: {
        append: jest.fn()
      }
    } as unknown as jest.Mocked<any> & jest.Mocked<Response>;
    const result = await refreshCredentials(
      MOCK_REQUEST,
      {...MOCK_OPTIONS, enableMultipleCookies: true},
      () => Promise.resolve(MOCK_RESPONSE)
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      1,
      'Set-Cookie',
      'TestCookie=TEST_ID_TOKEN%3ATEST_REFRESH_TOKEN'
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      2,
      'Set-Cookie',
      'TestCookie.custom=TEST_CUSTOM_TOKEN'
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      3,
      'Set-Cookie',
      'TestCookie.sig=MqBNRBcWwj7xL948-Yy89kj5dwPEf7fTACNx93rOFX4'
    );

    expect(result).toBe(MOCK_RESPONSE);
  });

  it('appends multiple cookie headers', async () => {
    const MOCK_RESPONSE = {
      headers: {
        append: jest.fn()
      }
    } as unknown as jest.Mocked<any> & jest.Mocked<Response>;
    await appendAuthCookies(MOCK_RESPONSE, customTokens, {
      ...MOCK_OPTIONS,
      enableMultipleCookies: true
    });

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      1,
      'Set-Cookie',
      'TestCookie=MOCK_ID_TOKEN%3AMOCK_REFRESH_TOKEN'
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      2,
      'Set-Cookie',
      'TestCookie.custom=MOCK_CUSTOM_TOKEN'
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenNthCalledWith(
      3,
      'Set-Cookie',
      'TestCookie.sig=AuSOlUSJENTLtShQpjf7SMRiPY4aILyFNmjr7Tc3Fig'
    );
  });

  it('appends custom auth headers', async () => {
    const MOCK_RESPONSE = {
      headers: {
        append: jest.fn(),
        get: jest.fn()
      }
    } as unknown as jest.Mocked<any> & jest.Mocked<Response>;

    await setAuthCookies(MOCK_RESPONSE.headers, MOCK_OPTIONS);

    expect(MOCK_RESPONSE.headers.get).toHaveBeenCalledWith(
      'Next-Authorization'
    );
  });
});
