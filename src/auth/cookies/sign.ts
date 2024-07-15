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

export type SignedCookies = {
  signed: string;
  custom: string;
  signature: string;
};

export async function signCookies(
  tokens: CustomTokens,
  keys: string[]
): Promise<SignedCookies> {
  const credential = new RotatingCredential(keys);
  const signed = `${tokens.idToken}:${tokens.refreshToken}`;
  const signature = await credential.createSignature(tokens);

  return {
    signed,
    custom: tokens.customToken,
    signature
  };
}

export async function parseCookies(
  {signed, custom, signature}: SignedCookies,
  keys: string[]
): Promise<CustomTokens> {
  if (!signed || !custom || !signature) {
    throw new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS);
  }

  const [idToken, refreshToken] = signed.split(':');

  if (!idToken || !refreshToken) {
    throw new InvalidTokenError(InvalidTokenReason.MALFORMED_CREDENTIALS);
  }

  const customTokens: CustomTokens = {
    idToken,
    refreshToken,
    customToken: custom
  };

  const credential = new RotatingCredential(keys);

  try {
    await credential.verifySignature(customTokens, signature);

    return customTokens;
  } catch (e) {
    if (e instanceof errors.JWSSignatureVerificationFailed) {
      throw new InvalidTokenError(InvalidTokenReason.INVALID_SIGNATURE);
    }

    throw e;
  }
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
