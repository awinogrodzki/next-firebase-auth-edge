import {errors} from 'jose';
import {
  CustomJWTPayload,
  createCustomJWT,
  verifyCustomJWT
} from './custom-token';

export class RotatingCredential {
  constructor(private keys: string[]) {}

  private async signPayload(
    payload: CustomJWTPayload,
    secret: string
  ): Promise<string> {
    return createCustomJWT(payload, secret);
  }

  public async sign(payload: CustomJWTPayload) {
    return this.signPayload(payload, this.keys[0]);
  }

  public async verify(customJWT: string): Promise<CustomJWTPayload> {
    for (const key of this.keys) {
      try {
        const result = await verifyCustomJWT(customJWT, key);
        return result.payload;
      } catch (e) {
        if (e instanceof errors.JWSSignatureVerificationFailed) {
          continue;
        }

        throw e;
      }
    }

    throw new errors.JWSSignatureVerificationFailed(
      'Custom JWT could not be verified against any of the provided keys'
    );
  }
}
