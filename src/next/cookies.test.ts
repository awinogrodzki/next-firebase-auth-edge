import {SetAuthCookiesOptions, refreshCredentials} from './cookies';

jest.mock('../auth', () => ({
  getFirebaseAuth: () => ({
    handleTokenRefresh: () => ({
      idToken: 'TEST_ID_TOKEN',
      refreshToken: 'TEST_REFRESH_TOKEN'
    })
  })
}));

const TEST_TOKEN =
  'eyJ0b2tlbnMiOnsiaWRUb2tlbiI6ImV4YW1wbGVfaWRfdG9rZW4iLCJyZWZyZXNoVG9rZW4iOiJleGFtcGxlX3JlZnJlc2hfdG9rZW4ifSwic2lnbmF0dXJlIjoia1hsUTZVVlIwbzY0cHpuQXBzdUxPOGdVQm1VUnVmNXZ6R2EycmMwRGo0WSJ9';
const TEST_TOKEN_SIGNED =
  'eyJ0b2tlbnMiOnsiaWRUb2tlbiI6IlRFU1RfSURfVE9LRU4iLCJyZWZyZXNoVG9rZW4iOiJURVNUX1JFRlJFU0hfVE9LRU4ifSwic2lnbmF0dXJlIjoiVmZfd2poWmJlRVV1cGcwSjdqQTdsQlVnQ2tyekxSb2Q4X1RYQ1JHYktiMCJ9';

const MOCK_REQUEST = {
  cookies: {
    get: () => ({value: TEST_TOKEN}),
    set: jest.fn()
  },
  headers: {
    get: jest.fn()
  }
} as unknown as jest.Mocked<any>;

const MOCK_OPTIONS: SetAuthCookiesOptions = {
  cookieName: 'TestCookie',
  cookieSignatureKeys: ['secret'],
  cookieSerializeOptions: {},
  apiKey: 'API_KEY'
};

describe('cookies', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

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
      TEST_TOKEN_SIGNED
    );

    expect(MOCK_RESPONSE.headers.append).toHaveBeenCalledWith(
      'Set-Cookie',
      `TestCookie=${TEST_TOKEN_SIGNED}`
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
      `TestCookie=${TEST_TOKEN_SIGNED}`
    );

    expect(result).toBe(MOCK_RESPONSE);
  });
});
