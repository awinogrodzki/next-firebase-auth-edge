import {
  arrayBufferToBase64,
  stringToArrayBuffer,
  objectToBase64,
  pemToArrayBuffer,
  base64StringToArrayBuffer,
  adaptBufferForNodeJS,
} from "./utils";
import { DecodedJWTHeader, DecodedJWTPayload, Immutable } from "./types";
import { ALGORITHMS } from "./consts";

export type SignOptions = {
  readonly payload: DecodedJWTPayload;
  readonly privateKey?: string;
  readonly secret?: string;
  readonly keyId?: string;
  readonly format?: "pkcs8";
  readonly algorithm?: "RS256";
  readonly extractable?: boolean;
  readonly keyUsages?: readonly string[];
};

function getKeyData(
  options: Immutable<Pick<SignOptions, "secret" | "privateKey">>
) {
  if (options.secret) {
    return base64StringToArrayBuffer(options.secret);
  }

  if (options.privateKey) {
    return pemToArrayBuffer(options.privateKey);
  }

  return base64StringToArrayBuffer("");
}

export async function sign({
  payload,
  privateKey,
  secret,
  keyId,
  format = "pkcs8",
  algorithm = "RS256",
  extractable = false,
  keyUsages = ["sign"],
}: Immutable<SignOptions>): Promise<string> {
  const keyData = getKeyData({ privateKey, secret });
  const key = await crypto.subtle.importKey(
    format,
    adaptBufferForNodeJS(keyData),
    ALGORITHMS[algorithm],
    extractable,
    keyUsages as KeyUsage[]
  );

  const header: DecodedJWTHeader = {
    typ: "JWT",
    alg: algorithm,
  };
  const encodedHeader = objectToBase64(
    keyId ? { ...header, kid: keyId } : header
  );
  const encodedPayload = objectToBase64(payload);
  const data = stringToArrayBuffer(`${encodedHeader}.${encodedPayload}`);

  const signature = await crypto.subtle.sign(
    ALGORITHMS[algorithm],
    key,
    adaptBufferForNodeJS(data)
  );
  const encodedSignature = arrayBufferToBase64(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}
