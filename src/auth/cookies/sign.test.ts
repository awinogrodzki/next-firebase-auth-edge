import {CustomTokens} from '../custom-token';
import {InvalidTokenError, InvalidTokenReason} from '../error';
import {parseCookies, parseTokens, signCookies, signTokens} from './sign';

const secret = 'some-secret';
const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6Ik1PQ0tfSURfVE9LRU4iLCJyZWZyZXNoX3Rva2VuIjoiTU9DS19SRUZSRVNIX1RPS0VOIiwiY3VzdG9tX3Rva2VuIjoiTU9DS19DVVNUT01fVE9LRU4ifQ.sJze1hnPLbZ0ZyZG7e98FzEB_vOxPMJ5dC5tObGLyqU';
const signature = '3bhtJ0IotJLntIx53HJuWf8FNUhKV7kVhuJKN_gY3J4';
const customTokens: CustomTokens = {
  idToken: 'MOCK_ID_TOKEN',
  refreshToken: 'MOCK_REFRESH_TOKEN',
  customToken: 'MOCK_CUSTOM_TOKEN'
};

const cookies = {
  custom: customTokens.customToken,
  signature,
  signed: `${customTokens.idToken}:${customTokens.refreshToken}`
};

describe('signTokens', () => {
  it('should sign provided id and refresh tokens into single string', async () => {
    const value = await signTokens(customTokens, [secret]);

    expect(value).toEqual(jwt);
  });
});

describe('signCookies', () => {
  it('should sign provided tokens into signature string', async () => {
    const result = await signCookies(customTokens, [secret]);

    expect(result).toEqual(cookies);
  });
});

describe('parseCookies', () => {
  it('should parse and verify provided cookies into tokens', async () => {
    const value = await parseCookies(cookies, [secret]);

    expect(value).toEqual(customTokens);
  });

  it('should throw invalid signature error if secret is invalid', async () => {
    return expect(() => parseCookies(cookies, ['foobar'])).rejects.toEqual(
      new InvalidTokenError(InvalidTokenReason.INVALID_SIGNATURE)
    );
  });

  it('should throw missing credentials error if cookies are empty', async () => {
    return expect(() =>
      parseCookies({custom: '', signed: '', signature: ''}, [secret])
    ).rejects.toEqual(
      new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS)
    );
  });

  it('should throw malformed credentials error if custom tokens are empty', async () => {
    const customTokens: CustomTokens = {
      idToken: '',
      refreshToken: '',
      customToken: 'asd'
    };

    const emptySignature = await signCookies(customTokens, [secret]);

    return expect(() => parseCookies(emptySignature, [secret])).rejects.toEqual(
      new InvalidTokenError(InvalidTokenReason.MALFORMED_CREDENTIALS)
    );
  });
});

describe('parseTokens', () => {
  it('should parse and verify provided string into id and refresh tokens', async () => {
    const value = await parseTokens(jwt, [secret]);

    expect(value).toEqual(customTokens);
  });

  it('should throw invalid signature error if secret is invalid', async () => {
    return expect(() => parseTokens(jwt, ['foobar'])).rejects.toEqual(
      new InvalidTokenError(InvalidTokenReason.INVALID_SIGNATURE)
    );
  });

  it('should throw missing credentials error if token is empty', async () => {
    return expect(() => parseTokens('', [secret])).rejects.toEqual(
      new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS)
    );
  });

  it('should throw malformed credentials error if custom tokens are empty', async () => {
    const customTokens: CustomTokens = {
      idToken: '',
      refreshToken: '',
      customToken: ''
    };

    const emptyJWT = await signTokens(customTokens, [secret]);

    return expect(() => parseTokens(emptyJWT, [secret])).rejects.toEqual(
      new InvalidTokenError(InvalidTokenReason.MALFORMED_CREDENTIALS)
    );
  });
});
