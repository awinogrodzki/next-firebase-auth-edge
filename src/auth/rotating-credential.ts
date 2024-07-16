import {errors} from 'jose';
import {
  CustomJWTPayload,
  CustomTokens,
  createCustomJWT,
  createCustomSignature,
  verifyCustomJWT,
  verifyCustomSignature
} from './custom-token';

export class RotatingCredential {
  constructor(private keys: string[]) {}

  public async sign(payload: CustomJWTPayload) {
    return createCustomJWT(payload, this.keys[0]);
  }

  public async createSignature(tokens: CustomTokens): Promise<string> {
    return createCustomSignature(tokens, this.keys[0]);
  }

  public async verify(customJWT: string): Promise<CustomJWTPayload> {
    for (const key of this.keys) {
      try {
        const result = await verifyCustomJWT(customJWT, key);
        return result.payload;
      } catch (e) {
        if (
          e instanceof errors.JWSSignatureVerificationFailed ||
          e instanceof errors.JWSInvalid
        ) {
          continue;
        }

        throw e;
      }
    }

    throw new errors.JWSSignatureVerificationFailed(
      'Custom JWT could not be verified against any of the provided keys'
    );
  }

  public async verifySignature(
    tokens: CustomTokens,
    signature: string
  ): Promise<void> {
    for (const key of this.keys) {
      try {
        return await verifyCustomSignature(tokens, signature, key);
      } catch (e) {
        if (
          e instanceof errors.JWSSignatureVerificationFailed ||
          e instanceof errors.JWSInvalid
        ) {
          continue;
        }

        throw e;
      }
    }

    throw new errors.JWSSignatureVerificationFailed(
      'Custom tokens signature could not be verified against any of the provided keys'
    );
  }
}
