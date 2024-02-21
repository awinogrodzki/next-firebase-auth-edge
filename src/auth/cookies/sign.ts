import {base64url} from 'jose';
import {IdAndRefreshTokens} from '..';
import {RotatingCredential} from '../rotating-credential';
import {InvalidTokenError, InvalidTokenReason} from '../error';

export async function signTokens(
  tokens: IdAndRefreshTokens,
  keys: string[]
): Promise<string> {
  const credential = new RotatingCredential(keys);
  const signature = await credential.sign(
    base64url.encode(`${tokens.idToken}.${tokens.refreshToken}`)
  );

  return base64url.encode(
    JSON.stringify({
      tokens: {idToken: tokens.idToken, refreshToken: tokens.refreshToken},
      signature
    })
  );
}

export async function parseTokens(
  value: string,
  keys: string[]
): Promise<IdAndRefreshTokens> {
  if (!value) {
    throw new InvalidTokenError(InvalidTokenReason.MISSING_CREDENTIALS);
  }

  const credential = new RotatingCredential(keys);
  const decoded = new TextDecoder().decode(base64url.decode(value));

  let parsed: {tokens?: IdAndRefreshTokens; signature?: string} = {};

  try {
    parsed = JSON.parse(decoded);
  } catch (error: unknown) {
    throw new InvalidTokenError(InvalidTokenReason.MALFORMED_CREDENTIALS);
  }

  if (!parsed.tokens || !parsed.signature) {
    throw new InvalidTokenError(InvalidTokenReason.MALFORMED_CREDENTIALS);
  }

  const {tokens, signature} = parsed;

  const result = await credential.verify(
    base64url.encode(`${tokens.idToken}.${tokens.refreshToken}`),
    signature
  );

  if (!result) {
    throw new InvalidTokenError(InvalidTokenReason.INVALID_SIGNATURE);
  }

  return tokens as IdAndRefreshTokens;
}
