import {errors} from 'jose';
import {CustomJWTPayload} from './custom-token';
import {RotatingCredential} from './rotating-credential';

describe('rotating-credential', () => {
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6Ik1PQ0sgSUQgVE9LRU4iLCJyZWZyZXNoX3Rva2VuIjoiTU9DSyBSRUZSRVNIIFRPS0VOIiwiY3VzdG9tX3Rva2VuIjoiTU9DSyBDVVNUT00gVE9LRU4ifQ.wOyqlxSHU2DyI0E8W-YRlDch5Dru8P802ncMMSvYzWo';
  const payload: CustomJWTPayload = {
    id_token: 'MOCK ID TOKEN',
    refresh_token: 'MOCK REFRESH TOKEN',
    custom_token: 'MOCK CUSTOM TOKEN'
  };

  it('should sign custom jwt payload', async () => {
    const credential = new RotatingCredential(['key1', 'key2']);
    const customJWT = await credential.sign(payload);

    expect(customJWT).toEqual(jwt);
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
