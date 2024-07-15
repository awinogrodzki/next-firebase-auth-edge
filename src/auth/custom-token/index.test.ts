import {errors} from 'jose';
import {CustomJWTPayload, createCustomJWT, verifyCustomJWT} from '.';

describe('custom jwt', () => {
  const secret = 'very-secure-secret';
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6Ik1PQ0tfSURfVE9LRU4iLCJyZWZyZXNoX3Rva2VuIjoiTU9DS19SRUZSRVNIX1RPS0VOIiwiY3VzdG9tX3Rva2VuIjoiTU9DS19DVVNUT01fVE9LRU4ifQ.-QNV35-rSl-jCgXHiR3gMW5G-TAkKcT5AimTc7BTPFA';
  const payload: CustomJWTPayload = {
    id_token: 'MOCK_ID_TOKEN',
    refresh_token: 'MOCK_REFRESH_TOKEN',
    custom_token: 'MOCK_CUSTOM_TOKEN'
  };

  it('generates custom jwt with id, refresh and custom tokens as a payload', async () => {
    const token = await createCustomJWT(payload, secret);

    expect(token).toEqual(jwt);
  });

  it('verifies custom jwt with provided secret', async () => {
    const result = await verifyCustomJWT(jwt, secret);

    expect(result.payload).toEqual(payload);
  });

  it('throws error when secret is invalid', async () => {
    return expect(() =>
      verifyCustomJWT(jwt, 'invalid-secret')
    ).rejects.toBeInstanceOf(errors.JWSSignatureVerificationFailed);
  });
});
