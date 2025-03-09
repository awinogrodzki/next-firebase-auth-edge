import {errors} from 'jose';
import {
  CustomJWTPayload,
  ParsedCookies,
  createCustomJWT,
  createCustomSignature,
  verifyCustomJWT,
  verifyCustomSignature
} from './custom-token/index.js';

export class RotatingCredential<Metadata extends object> {
  constructor(private keys: string[]) {}

  public async sign(payload: CustomJWTPayload<Metadata>) {
    return createCustomJWT(payload, this.keys[0]);
  }

  public async createSignature(
    value: ParsedCookies<Metadata>
  ): Promise<string> {
    return createCustomSignature(value, this.keys[0]);
  }

  public async verify(customJWT: string): Promise<CustomJWTPayload<Metadata>> {
    for (const key of this.keys) {
      try {
        const result = await verifyCustomJWT<Metadata>(customJWT, key);
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
    value: ParsedCookies<Metadata>,
    signature: string
  ): Promise<void> {
    for (const key of this.keys) {
      try {
        return await verifyCustomSignature(value, signature, key);
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
