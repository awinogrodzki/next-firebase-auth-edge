import { decode } from "./decode";
import { DecodedJWTPayload } from "./types";

export type IsExpiredOptions = {
  readonly expiredWithinSeconds?: number;
};

export function isExpired(
  jwt: string,
  { expiredWithinSeconds = 0 }: IsExpiredOptions = {}
): boolean {
  const { exp } = decode(jwt) as DecodedJWTPayload;
  return (
    typeof exp === "number" &&
    exp < Math.floor(new Date().getTime() / 1000) + expiredWithinSeconds
  );
}
