import {errors} from 'jose';
import {CustomJWTPayload, ParsedCookies} from './custom-token/index.js';
import {RotatingCredential} from './rotating-credential.js';

type MockMetadata = {foo: 'bar'};

describe('rotating-credential', () => {
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6Ik1PQ0tfSURfVE9LRU4iLCJyZWZyZXNoX3Rva2VuIjoiTU9DS19SRUZSRVNIX1RPS0VOIiwiY3VzdG9tX3Rva2VuIjoiTU9DS19DVVNUT01fVE9LRU4iLCJtZXRhZGF0YSI6eyJmb28iOiJiYXIifX0.F54FoDyst6RipYvP9pma6ID7rRAcho_4Pl3Sp6Fr2I4';
  const signature = 'OjicIJZDY8ZipDpsHnwET1M3F1n7oRwd87SMgH_77Kk';

  const payload: CustomJWTPayload<MockMetadata> = {
    id_token: 'MOCK_ID_TOKEN',
    refresh_token: 'MOCK_REFRESH_TOKEN',
    custom_token: 'MOCK_CUSTOM_TOKEN',
    metadata: {foo: 'bar'}
  };

  const customTokens: ParsedCookies<MockMetadata> = {
    idToken: 'MOCK_ID_TOKEN',
    refreshToken: 'MOCK_REFRESH_TOKEN',
    customToken: 'MOCK_CUSTOM_TOKEN',
    metadata: {foo: 'bar'}
  };

  it('should sign custom jwt payload', async () => {
    const credential = new RotatingCredential(['key1', 'key2']);
    const customJWT = await credential.sign(payload);

    expect(customJWT).toEqual(jwt);
  });

  it('should create signature', async () => {
    const credential = new RotatingCredential(['key1', 'key2']);
    const customSignature = await credential.createSignature(customTokens);

    expect(customSignature).toEqual(signature);
  });

  it('should verify signature', async () => {
    const credential = new RotatingCredential(['key1', 'key2']);

    return expect(() => credential.verifySignature(customTokens, signature))
      .resolves;
  });

  it('should verify signature with rotated keys', async () => {
    const credential = new RotatingCredential(['key3', 'key1']);

    await credential.verifySignature(customTokens, signature);
  });

  it('should throw invalid signature error if no keys match signature', async () => {
    const credential = new RotatingCredential(['key3']);

    return expect(() =>
      credential.verifySignature(customTokens, signature)
    ).rejects.toBeInstanceOf(errors.JWSSignatureVerificationFailed);
  });

  it('should verify custom jwt payload', async () => {
    const credential = new RotatingCredential(['key1', 'key2']);

    const result = await credential.verify(jwt);

    expect(result).toEqual(payload);
  });

  it('should verify custom jwt payload with rotated key', async () => {
    const credential = new RotatingCredential(['key0', 'key1']);

    const result = await credential.verify(jwt);

    expect(result).toEqual(payload);
  });

  it('should throw invalid signature error if no key matches signature', async () => {
    const credential = new RotatingCredential(['key3', 'key4']);

    return expect(() => credential.verify(jwt)).rejects.toBeInstanceOf(
      errors.JWSSignatureVerificationFailed
    );
  });
});
