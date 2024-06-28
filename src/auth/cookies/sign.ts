import {errors} from 'jose';
import {CustomTokens} from '../custom-token';
import {InvalidTokenError, InvalidTokenReason} from '../error';
import {RotatingCredential} from '../rotating-credential';

export async function signTokens(
  tokens: CustomTokens,
  keys: string[]
): Promise<string> {
  const credential = new RotatingCredential(keys);

  return credential.sign({
    id_token: tokens.idToken,
    refresh_token: tokens.refreshToken,
    custom_token: tokens.customToken
  });
}

export async function parseTokens(
  customJWT: string,
  keys: string[]
): Promise<CustomTokens> {
  if (!customJWT) {
    throw new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS);
  }

  const credential = new RotatingCredential(keys);

  try {
    const result = await credential.verify(customJWT);

    if (!result.id_token || !result.refresh_token || !result.custom_token) {
      throw new InvalidTokenError(InvalidTokenReason.MALFORMED_CREDENTIALS);
    }

    return {
      idToken: result.id_token,
      refreshToken: result.refresh_token,
      customToken: result.custom_token
    };
  } catch (e) {
    if (e instanceof errors.JWSSignatureVerificationFailed) {
      throw new InvalidTokenError(InvalidTokenReason.INVALID_SIGNATURE);
    }

    throw e;
  }
}
