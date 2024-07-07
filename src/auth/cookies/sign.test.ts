import {CustomTokens} from '../custom-token';
import {InvalidTokenError, InvalidTokenReason} from '../error';
import {parseTokens, signTokens} from './sign';

const secret = 'some-secret';
const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6Ik1PQ0sgSUQgVE9LRU4iLCJyZWZyZXNoX3Rva2VuIjoiTU9DSyBSRUZSRVNIIFRPS0VOIiwiY3VzdG9tX3Rva2VuIjoiTU9DSyBDVVNUT00gVE9LRU4ifQ.kTqBXm7eX9W9kWpgIGoTDUFvA5m8X_JfBNVcOPQZZ_w';
const customTokens: CustomTokens = {
  idToken: 'MOCK ID TOKEN',
  refreshToken: 'MOCK REFRESH TOKEN',
  customToken: 'MOCK CUSTOM TOKEN'
};

describe('signTokens', () => {
  it('should sign provided id and refresh tokens into single string', async () => {
    const value = await signTokens(customTokens, [secret]);

    expect(value).toEqual(jwt);
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
