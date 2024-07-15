import {errors} from 'jose';
import {CustomJWTPayload, CustomTokens} from './custom-token';
import {RotatingCredential} from './rotating-credential';

describe('rotating-credential', () => {
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6Ik1PQ0tfSURfVE9LRU4iLCJyZWZyZXNoX3Rva2VuIjoiTU9DS19SRUZSRVNIX1RPS0VOIiwiY3VzdG9tX3Rva2VuIjoiTU9DS19DVVNUT01fVE9LRU4ifQ.t5AtcgCy43udQyU62pwIWhk6MM179Q891VoEC6RZTe4';
  const signature = 'Jyr2abaKtiXBmyp14Dc4Uxf_DM0PKE9FS5zDzVS97TA';

  const payload: CustomJWTPayload = {
    id_token: 'MOCK_ID_TOKEN',
    refresh_token: 'MOCK_REFRESH_TOKEN',
    custom_token: 'MOCK_CUSTOM_TOKEN'
  };

  const customTokens: CustomTokens = {
    idToken: 'MOCK_ID_TOKEN',
    refreshToken: 'MOCK_REFRESH_TOKEN',
    customToken: 'MOCK_CUSTOM_TOKEN'
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
