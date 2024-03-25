import { base64url, cryptoRuntime } from 'jose';

function getRuntimeDigest() {
  if (cryptoRuntime === 'WebCryptoAPI') {
    return require('./web');
  }

  return require('./node');
}

export async function digest(
  alg: 'sha256' | 'sha384' | 'sha512',
  data: string
): Promise<string> {
  return base64url.encode(
    await getRuntimeDigest().digest(alg, new TextEncoder().encode(data))
  );
}
