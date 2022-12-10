import { base64StringToObject } from "./utils";
import { DecodedJWTHeader, DecodedJWTPayload } from "./types";

export type DecodeOptions = {
  readonly complete?: boolean;
};

export type DecodedJWT = {
  header: DecodedJWTHeader;
  payload: DecodedJWTPayload;
  signature: string;
};

export function decode(
  jwt: string,
  { complete = false }: DecodeOptions = {}
): DecodedJWT | DecodedJWTPayload {
  const [encodedHeader, encodedPayload, signature] = jwt.split(".");

  const payload = base64StringToObject(encodedPayload) as DecodedJWTPayload;

  return complete
    ? {
        header: base64StringToObject(encodedHeader) as DecodedJWTHeader,
        payload,
        signature,
      }
    : payload;
}
