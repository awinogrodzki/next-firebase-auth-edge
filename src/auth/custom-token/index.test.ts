import {errors} from 'jose';
import {CustomJWTPayload, createCustomJWT, verifyCustomJWT} from '.';

describe('custom jwt', () => {
  const secret = 'very-secure-secret';
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6Ik1PQ0sgSUQgVE9LRU4iLCJyZWZyZXNoX3Rva2VuIjoiTU9DSyBSRUZSRVNIIFRPS0VOIiwiY3VzdG9tX3Rva2VuIjoiTU9DSyBDVVNUT00gVE9LRU4ifQ.Y9WD7_nVQ0k2QCmke4cgmDMLD1ThjskojFlvPGypnLU';
  const payload: CustomJWTPayload = {
    id_token: 'MOCK ID TOKEN',
    refresh_token: 'MOCK REFRESH TOKEN',
    custom_token: 'MOCK CUSTOM TOKEN'
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
