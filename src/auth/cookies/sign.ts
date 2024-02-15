import {base64url} from 'jose';
import {IdAndRefreshTokens} from '..';
import {RotatingCredential} from '../rotating-credential';

export async function signTokens(
  tokens: IdAndRefreshTokens,
  keys: string[]
): Promise<string> {
  const credential = new RotatingCredential(keys);
  const signature = await credential.sign(
    `${tokens.idToken}.${tokens.refreshToken}`
  );

  return base64url.encode(JSON.stringify({tokens, signature}));
}

export async function parseTokens(
  value: string,
  keys: string[]
): Promise<IdAndRefreshTokens | null> {
  const credential = new RotatingCredential(keys);
  const decoded = new TextDecoder().decode(base64url.decode(value));

  if (!decoded) {
    return null;
  }

  const {tokens, signature} = JSON.parse(decoded);

  if (!tokens || !signature) {
    return null;
  }

  const result = await credential.verify(
    `${tokens.idToken}.${tokens.refreshToken}`,
    signature
  );

  if (!result) {
    return null;
  }

  return tokens as IdAndRefreshTokens;
}
