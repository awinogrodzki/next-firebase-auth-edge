import {SetAuthCookiesOptions, refreshCredentials} from './cookies';

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
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6Ik1PQ0sgSUQgVE9LRU4iLCJyZWZyZXNoX3Rva2VuIjoiTU9DSyBSRUZSRVNIIFRPS0VOIiwiY3VzdG9tX3Rva2VuIjoiTU9DSyBDVVNUT00gVE9LRU4ifQ.Y9WD7_nVQ0k2QCmke4cgmDMLD1ThjskojFlvPGypnLU';
const refreshedJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6IlRFU1RfSURfVE9LRU4iLCJyZWZyZXNoX3Rva2VuIjoiVEVTVF9SRUZSRVNIX1RPS0VOIiwiY3VzdG9tX3Rva2VuIjoiVEVTVF9DVVNUT01fVE9LRU4ifQ.2tjn-__AKP3J7w9vIDuFDFkYmPzpuGpWvHvBFksMh5E';
const MOCK_REQUEST = {
  cookies: {
    get: () => ({value: jwt}),
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
});
