import { JwtError, JwtErrorCode } from "./error";
import { decode } from "./decode";
import { base64StringToArrayBuffer, stringToArrayBuffer } from "./utils";
import { ALGORITHMS } from "./consts";
import { pemToPublicKey } from "../pem-to-public-key";

interface VerifyOptions {
  complete?: boolean;
  clockTimestamp?: number;
  nonce?: string;
  readonly format: "spki";
  readonly algorithm: "RS256";
}

const keyMap: Record<string, CryptoKey> = {};

async function getCachedPublicKeyFromCertificate(
  pem: string
): Promise<CryptoKey> {
  if (keyMap[pem]) {
    return keyMap[pem];
  }

  return (keyMap[pem] = await pemToPublicKey(pem));
}

function createKeyFromCertificatePEM(pem: string) {
  return getCachedPublicKeyFromCertificate(pem);
}

export async function getPublicCryptoKey(
  publicKey: string,
  options: VerifyOptions
): Promise<CryptoKey> {
  if (publicKey.startsWith("-----BEGIN CERTIFICATE-----")) {
    return createKeyFromCertificatePEM(
      publicKey
        .replace("-----BEGIN CERTIFICATE-----", "")
        .replace("-----END CERTIFICATE-----", "")
        .replace(/\n/g, "")
    );
  }

  const base64 = publicKey
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\n/g, "");
  const buffer = base64StringToArrayBuffer(base64);

  return crypto.subtle.importKey(
    options.format,
    buffer,
    ALGORITHMS[options.algorithm],
    false,
    ["verify"]
  );
}

export async function verify(
  jwtString: string,
  secretOrPublicKey: string,
  options: VerifyOptions = {
    format: "spki",
    algorithm: "RS256",
  }
) {
  if (options.nonce !== undefined && !options.nonce.trim()) {
    throw new JwtError(
      JwtErrorCode.INVALID_ARGUMENT,
      "nonce must be a non-empty string"
    );
  }

  const clockTimestamp =
    options.clockTimestamp || Math.floor(Date.now() / 1000);

  if (!jwtString) {
    throw new JwtError(JwtErrorCode.INVALID_ARGUMENT, "jwt must be valid");
  }

  const parts = jwtString.split(".");

  if (parts.length !== 3) {
    throw new JwtError(JwtErrorCode.INVALID_ARGUMENT, "jwt malformed");
  }

  const decodedToken = decode(jwtString, { complete: true });

  if (!decodedToken) {
    throw new JwtError(JwtErrorCode.INVALID_ARGUMENT, "invalid token");
  }

  const header = decodedToken.header;
  const signature = parts[2].trim();
  const hasSignature = signature !== "";

  if (!hasSignature && secretOrPublicKey) {
    throw new JwtError(
      JwtErrorCode.INVALID_SIGNATURE,
      "jwt signature is required"
    );
  }

  if (hasSignature && !secretOrPublicKey) {
    throw new JwtError(
      JwtErrorCode.INVALID_CREDENTIAL,
      "secret or public key must be provided"
    );
  }

  if (decodedToken.header.alg !== options.algorithm) {
    throw new JwtError(
      JwtErrorCode.INVALID_ARGUMENT,
      "unsupported algorithm: " + decodedToken.header.alg
    );
  }

  const data = parts.slice(0, 2).join(".");

  const key = await getPublicCryptoKey(secretOrPublicKey, options);
  const jwtBuffer = stringToArrayBuffer(data);
  const sigBuffer = base64StringToArrayBuffer(signature);

  const result = await crypto.subtle.verify(
    ALGORITHMS[options.algorithm],
    key,
    sigBuffer,
    jwtBuffer
  );

  if (!result) {
    throw new JwtError(JwtErrorCode.INVALID_SIGNATURE, "invalid signature");
  }

  const payload = decodedToken.payload;

  if (typeof payload.nbf !== "undefined") {
    if (typeof payload.nbf !== "number") {
      throw new JwtError(JwtErrorCode.INVALID_ARGUMENT, "invalid nbf value");
    }
    if (payload.nbf > clockTimestamp) {
      throw new JwtError(
        JwtErrorCode.TOKEN_EXPIRED,
        "jwt not active: " + new Date(payload.nbf * 1000).toISOString()
      );
    }
  }

  if (typeof payload.exp !== "undefined") {
    if (typeof payload.exp !== "number") {
      throw new JwtError(JwtErrorCode.INVALID_ARGUMENT, "invalid exp value");
    }

    if (clockTimestamp >= payload.exp) {
      throw new JwtError(
        JwtErrorCode.TOKEN_EXPIRED,
        "token expired: " + new Date(payload.exp * 1000).toISOString()
      );
    }
  }

  if (options.nonce) {
    if (payload.nonce !== options.nonce) {
      throw new JwtError(
        JwtErrorCode.INVALID_ARGUMENT,
        "jwt nonce invalid. expected: " + options.nonce
      );
    }
  }

  if (options.complete === true) {
    const signature = decodedToken.signature;

    return {
      header: header,
      payload: payload,
      signature: signature,
    };
  }

  return payload;
}
